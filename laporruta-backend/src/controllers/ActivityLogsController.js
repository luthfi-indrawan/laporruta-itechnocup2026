const activityLogsService = require("../services/ActivityLogsService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class ActivityLogsController {
  async getTimeline(req, res, next) {
    try {
      const result = await activityLogsService.getTimeline(req.params.id);
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ActivityLogsController();
