const { getClient } = require("../config/database");
const reportsModel = require("../models/reportsModel");
const reportImagesModel = require("../models/reportImagesModel");
const activityLogsModel = require("../models/ActivityLogsModel");
const commentsModel = require("../models/CommentsModel");
const disputesModel = require("../models/disputesModel");
const usersModel = require("../models/usersModel");
const { uploadFile, deleteFiles, getPublicUrl } = require("../config/supabase");
const STORAGE = require("../constants/storagePaths");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");
const socketHelper = require("../utils/socketHelper");

class ReportsService {
  async createReport(userId, payload, files) {
    const {
      title,
      description,
      category_id,
      wilayah_id,
      address_text,
      lat,
      lng,
    } = payload;

    const client = await getClient();

    try {
      await client.query("BEGIN");

      const report = await reportsModel.create(
        {
          userId,
          title,
          description,
          categoryId: category_id,
          wilayahId: wilayah_id,
          address_text: address_text,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
        },
        client,
      );

      const uploadedImages = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const filePath = STORAGE.REPORT_PATH(report.id, file.safeFilename);

          await uploadFile("src", filePath, file.buffer, {
            contentType: file.mimetype,
          });

          const imageUrl = getPublicUrl("src", filePath);
          await reportImagesModel.create(
            {
              reportId: report.id,
              imageUrl,
              filePath,
              isAfter: false,
            },
            client,
          );
          uploadedImages.push(filePath);
        }
      }

      await activityLogsModel.create(
        {
          reportId: report.id,
          actorId: userId,
          actionType: "report_created",
          oldValue: null,
          newValue: "pending_verification",
        },
        client,
      );

      await client.query("COMMIT");

      const admins = await usersModel.findAdmins({
        role: "admin_wilayah",
        isActive: true,
      });

      const zoneAdmin = admins.data.find(
        (a) => a.assigned_wilayah_id === report.wilayah_id,
      );

      socketHelper.broadcastNewReportAssigned(
        report.wilayah_id,
        {
          id: report.id,
          title: report.title,
          status: report.status,
          created_at: report.created_at,
        },
        !zoneAdmin,
      );

      return { id: report.id, status: report.status };
    } catch (error) {
      await client.query("ROLLBACK");
      // Cleanup uploaded files if any
      throw error;
    } finally {
      client.release();
    }
  }

  async getMyReports(userId, { page, limit }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const user = await usersModel.findById(userId);

    const { data, total } = await reportsModel.findByUserId(userId, {
      page: pageNum,
      limit: limitNum,
    });

    const enriched = await Promise.all(
      data.map(async (report) => ({
        id: report.id,
        title: report.title,
        status: report.status,

        category: {
          id: report.category_id,
          name: report.category_name,
          icon: report.category_icon,
          color: report.category_color,
        },

        created_at: report.created_at,
        updated_at: report.updated_at,

        thumbnail_url: report.thumbnail_url,

        upvote_count: parseInt(report.upvote_count, 10) || 0,

        comment_count:
          (await commentsModel.getCountForReport({
            reportId: report.id,
          })) || 0,

        is_unread:
          user && user.last_seen_at
            ? new Date(report.updated_at) > new Date(user.last_seen_at)
            : true,
      })),
    );

    const totalPages = Math.ceil(total / limitNum);

    return {
      data: enriched,
      metadata: {
        current_page: pageNum,
        page_size: limitNum,
        total_pages: totalPages,
        total_items: total,
        has_next_page: pageNum < totalPages,
        has_prev_page: pageNum > 1,
      },
    };
  }

  async getMyReportDetail(userId, reportId) {
    const report = await reportsModel.findByIdAndUserId(reportId, userId);

    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const [images, timeline, comments] = await Promise.all([
      reportImagesModel.findByReportId(reportId),
      activityLogsModel.findByReportId(reportId),
      commentsModel.findByReportId(reportId, {
        page: 1,
        limit: 100,
      }),
    ]);

    return {
      id: report.id,
      title: report.title,
      description: report.description,
      status: report.status,
      address_text: report.address_text,

      lat: report.lat !== null ? parseFloat(report.lat) : null,
      lng: report.lng !== null ? parseFloat(report.lng) : null,

      category: {
        id: report.category_id,
        name: report.category_name,
        color: report.category_color,
        icon: report.category_icon,
      },

      wilayah: {
        id: report.wilayah_id,
        name: report.wilayah_name,
        type: report.wilayah_type,
      },

      images: images.map((image) => ({
        id: image.id,
        image_url: image.image_url,
        is_after: image.is_after,
      })),

      timeline: timeline.map((activity) => ({
        id: activity.id,
        action_type: activity.action_type,
        actor_name: activity.actor_name,
        old_value: activity.old_value,
        new_value: activity.new_value,
        is_override: activity.is_override,
        created_at: activity.created_at,
      })),

      comments: comments.data,
      comment_count: comments.data.length,

      created_at: report.created_at,
      updated_at: report.updated_at,
    };
  }

  async createDispute(userId, reportId, reason) {
    const report = await reportsModel.findByIdAndUserId(reportId, userId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }
    if (report.status !== "resolved") {
      const err = new Error(MESSAGES.REPORT.ALREADY_RESOLVED);
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }

    const dispute = await disputesModel.create({ reportId, userId, reason });

    await activityLogsModel.create({
      reportId,
      actorId: userId,
      actionType: "dispute_requested",
      oldValue: null,
      newValue: null,
      metadata: { dispute_id: dispute.id, reason },
    });

    return { dispute_id: dispute.id, status: dispute.status };
  }
}

module.exports = new ReportsService();
