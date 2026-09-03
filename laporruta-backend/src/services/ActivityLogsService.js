const activityLogsModel = require("../models/activityLogsModel");
const reportsModel = require("../models/reportsModel");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");

class ActivityLogsService {
  async getTimeline(reportId) {
    const report = await reportsModel.findById(reportId);
    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    // Public can only see public reports timeline
    const publicStatuses = ["verified", "in_progress", "resolved"];
    if (!publicStatuses.includes(report.status)) {
      const err = new Error(MESSAGES.REPORT.NOT_PUBLIC);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    return activityLogsModel.findByReportId(reportId);
  }
}

module.exports = new ActivityLogsService();
