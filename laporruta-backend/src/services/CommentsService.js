const commentsModel = require("../models/commentsModel");
const reportsModel = require("../models/reportsModel");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");

class CommentsService {
  async getComments(reportId, { page, limit }) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const { data, total } = await commentsModel.findByReportId(reportId, {
      page: pageNum,
      limit: limitNum,
    });

    const totalPages = Math.ceil(total / limitNum);
    return {
      data,
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

  async createComment(userId, reportId, text) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const comment = await commentsModel.create({ reportId, userId, text });
    return comment;
  }
}

module.exports = new CommentsService();
