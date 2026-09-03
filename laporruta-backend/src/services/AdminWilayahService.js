const { getClient } = require("../config/database");
const reportsModel = require("../models/reportsModel");
const reportImagesModel = require("../models/reportImagesModel");
const reportAdminNotesModel = require("../models/reportAdminNotesModel");
const activityLogsModel = require("../models/ActivityLogsModel");
const commentsModel = require("../models/CommentsModel");
const { uploadFile, getPublicUrl } = require("../config/supabase");
const STORAGE = require("../constants/storagePaths");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");
const socketHelper = require("../utils/socketHelper");

class AdminWilayahService {
  _assertZone(report, adminWilayahId) {
    if (report.wilayah_id !== adminWilayahId) {
      const err = new Error("Anda tidak memiliki akses ke laporan di zona ini");
      err.statusCode = HTTP_STATUS.FORBIDDEN;
      throw err;
    }
  }

  _assertStatus(report, expected) {
    if (report.status !== expected) {
      const err = new Error(MESSAGES.REPORT.INVALID_TRANSITION);
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  }

  async getReports(adminWilayahId, filters = {}) {
    const page = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(filters.limit, 10) || 20, 1),
      100,
    );

    const { data, total } = await reportsModel.findForAdmin({
      wilayahId: adminWilayahId,
      status: filters.status,
      categoryId: filters.category_id,
      sort: filters.sort || "priority",
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((report) => ({
        id: report.id,
        title: report.title,
        status: report.status,

        category: {
          name: report.category_name,
          icon: report.category_icon,
          color: report.category_color,
        },

        priority_score: Number(report.priority_score),

        reporter: {
          full_name: report.reporter_name,
        },

        upvote_count: Number(report.upvote_count),
        comment_count: Number(report.comment_count),

        is_unread: Boolean(report.is_unread),

        created_at: report.created_at,
        updated_at: report.updated_at,

        thumbnail_url: report.thumbnail_url,
      })),

      metadata: {
        current_page: page,
        page_size: limit,
        total_pages: totalPages,
        total_items: total,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
    };
  }

  async getPendingReports(adminWilayahId) {
    const { data } = await reportsModel.findForAdmin({
      wilayahId: adminWilayahId,
      status: "pending_verification",
      page: 1,
      limit: 100,
    });
    return {
      data: data.map((report) => ({
        id: report.id,
        title: report.title,
        status: report.status,

        category: {
          name: report.category_name,
          icon: report.category_icon,
          color: report.category_color,
        },

        priority_score: Number(report.priority_score),

        reporter: {
          full_name: report.reporter_name,
        },

        upvote_count: Number(report.upvote_count),
        comment_count: Number(report.comment_count),

        is_unread: Boolean(report.is_unread),

        created_at: report.created_at,
        updated_at: report.updated_at,

        thumbnail_url: report.thumbnail_url,
      })),
    };
  }

  async getReportDetail(reportId, adminWilayahId) {
    const report = await reportsModel.findById(reportId);

    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    this._assertZone(report, adminWilayahId);

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

      priority_score: parseFloat(report.priority_score),

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
      comment_count: comments.total,

      created_at: report.created_at,
      updated_at: report.updated_at,
    };
  }

  async verifyReport(reportId, adminId, adminWilayahId) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }
    this._assertZone(report, adminWilayahId);
    this._assertStatus(report, "pending_verification");

    const updated = await reportsModel.updateStatus(reportId, "verified", null);

    await activityLogsModel.create({
      reportId,
      actorId: adminId,
      actionType: "verified",
      oldValue: "pending_verification",
      newValue: "verified",
    });

    socketHelper.broadcastReportVerified({
      id: updated.id,
      title: updated.title,
      status: updated.status,
      wilayah_id: updated.wilayah_id,
      updated_at: updated.updated_at,
    });

    return updated;
  }

  async rejectReport(reportId, adminId, adminWilayahId, rejectionReason) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }
    this._assertZone(report, adminWilayahId);
    this._assertStatus(report, "pending_verification");

    const updated = await reportsModel.updateStatus(
      reportId,
      "rejected",
      rejectionReason,
    );

    await activityLogsModel.create({
      reportId,
      actorId: adminId,
      actionType: "rejected",
      oldValue: "pending_verification",
      newValue: "rejected",
      metadata: { rejection_reason: rejectionReason },
    });

    return updated;
  }

  async updateStatus(reportId, adminId, adminWilayahId, { status, note }) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }
    this._assertZone(report, adminWilayahId);

    const validTransitions = {
      verified: ["in_progress"],
      in_progress: ["resolved"],
    };

    if (!validTransitions[report.status]?.includes(status)) {
      const err = new Error(MESSAGES.REPORT.INVALID_TRANSITION);
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }

    const updated = await reportsModel.updateStatus(reportId, status, null);

    await activityLogsModel.create({
      reportId,
      actorId: adminId,
      actionType: "status_changed",
      oldValue: report.status,
      newValue: status,
      metadata: note ? { note } : null,
    });

    socketHelper.broadcastReportStatusChanged({
      report_id: reportId,
      status,
      old_status: report.status,
      wilayah_id: report.wilayah_id,
      is_override: false,
    });

    return updated;
  }

  async uploadAfterImages(reportId, adminId, adminWilayahId, files) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }
    this._assertZone(report, adminWilayahId);

    const uploaded = [];
    for (const file of files) {
      const filePath = STORAGE.AFTER_PATH(reportId, file.safeFilename);
      await uploadFile("src", filePath, file.buffer, {
        contentType: file.mimetype,
      });
      const imageUrl = getPublicUrl("src", filePath);
      await reportImagesModel.create({
        reportId,
        imageUrl,
        filePath,
        isAfter: true,
      });
      uploaded.push({ image_url: imageUrl, file_path: filePath });
    }

    return uploaded;
  }

  async createNote(reportId, adminId, adminWilayahId, note) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }
    this._assertZone(report, adminWilayahId);

    return reportAdminNotesModel.create({ reportId, adminId, note });
  }

  async getNotes(reportId, adminWilayahId) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }
    this._assertZone(report, adminWilayahId);
    return reportAdminNotesModel.findByReportId(reportId);
  }
}

module.exports = new AdminWilayahService();
