const reportsModel = require("../models/reportsModel");
const reportImagesModel = require("../models/reportImagesModel");
const reportAdminNotesModel = require("../models/reportAdminNotesModel");
const activityLogsModel = require("../models/activityLogsModel");
const usersModel = require("../models/usersModel");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");
const socketHelper = require("../utils/socketHelper");
const commentsModel = require("../models/commentsModel");
class AdminPusatService {
  async getAllReports(filters) {
    const page = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(filters.limit, 10) || 20, 1),
      100,
    );

    const { data, total } = await reportsModel.findForAdmin({
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

  async getZonelessReports() {
    return reportsModel.findZonelessPending();
  }

  async overrideStatus(reportId, adminId, { status, reason }) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const updated = await reportsModel.updateStatus(reportId, status, null);

    await activityLogsModel.create({
      reportId,
      actorId: adminId,
      actionType: "override",
      oldValue: report.status,
      newValue: status,
      metadata: { reason },
      isOverride: true,
    });

    socketHelper.broadcastReportStatusChanged({
      report_id: reportId,
      status,
      old_status: report.status,
      wilayah_id: report.wilayah_id,
      is_override: true,
    });

    socketHelper.broadcastOverridePerformed({
      report_id: reportId,
      old_status: report.status,
      new_status: status,
      reason,
      admin_id: adminId,
    });

    return updated;
  }

  async reassignZone(reportId, adminId, newWilayahId) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const oldWilayahId = report.wilayah_id;
    const updated = await reportsModel.updateWilayah(reportId, newWilayahId);

    await activityLogsModel.create({
      reportId,
      actorId: adminId,
      actionType: "zone_reassigned",
      oldValue: oldWilayahId,
      newValue: newWilayahId,
    });

    socketHelper.broadcastZoneReassigned(oldWilayahId, newWilayahId, {
      report_id: reportId,
      old_wilayah_id: oldWilayahId,
      new_wilayah_id: newWilayahId,
    });

    return updated;
  }

  async editReport(reportId, adminId, payload) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const updated = await reportsModel.updateMetadata(reportId, payload);

    await activityLogsModel.create({
      reportId,
      actorId: adminId,
      actionType: "override",
      oldValue: JSON.stringify({
        title: report.title,
        description: report.description,
        category_id: report.category_id,
        address_text: report.address_text,
      }),
      newValue: JSON.stringify(payload),
      isOverride: true,
    });

    return updated;
  }

  async getStatistics() {
    return reportsModel.getStats();
  }

  async getHeatmapData() {
    return reportsModel.getHeatmapData();
  }

  async exportCsv(filters) {
    return reportsModel.getExportData({
      status: filters.status,
      categoryId: filters.category_id,
      wilayahId: filters.wilayah_id,
      dateFrom: filters.date_from,
      dateTo: filters.date_to,
    });
  }

  async getReportDetail(reportId) {
    const report = await reportsModel.findById(reportId);

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
}

module.exports = new AdminPusatService();
