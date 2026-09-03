const { getClient } = require("../config/database");
const reportsModel = require("../models/reportsModel");
const upvotesModel = require("../models/upvotesModel");
const activityLogsModel = require("../models/ActivityLogsModel");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");
const socketHelper = require("../utils/socketHelper");

class UpvotesService {
  async toggleUpvote(userId, reportId) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const eligible = ["verified", "in_progress", "resolved"];
    if (!eligible.includes(report.status)) {
      const err = new Error(MESSAGES.UPVOTE.NOT_ELIGIBLE);
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }

    const client = await getClient();
    try {
      await client.query("BEGIN");

      const existing = await upvotesModel.findByReportAndUser(
        reportId,
        userId,
        client,
      );
      let actionType;
      let hasUpvoted;

      if (existing) {
        await upvotesModel.delete(reportId, userId, client);
        actionType = "upvote_removed";
        hasUpvoted = false;
      } else {
        await upvotesModel.create(reportId, userId, client);
        actionType = "upvote_added";
        hasUpvoted = true;
      }

      const upvoteCount = await upvotesModel.countByReportId(reportId);

      await activityLogsModel.create(
        {
          reportId,
          actorId: userId,
          actionType,
          oldValue: null,
          newValue: String(upvoteCount),
        },
        client,
      );

      await client.query("COMMIT");

      socketHelper.broadcastUpvoteChanged(reportId, upvoteCount, hasUpvoted);

      return { upvote_count: upvoteCount, has_upvoted: hasUpvoted };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getUpvoteCount(reportId) {
    const count = await upvotesModel.countByReportId(reportId);
    return { upvote_count: count };
  }
}

module.exports = new UpvotesService();
