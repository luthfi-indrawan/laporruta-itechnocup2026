const userPresenceService = require("../services/UserPresenceService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class UserPresenceController {
  async updateLastSeen(req, res, next) {
    try {
      const result = await userPresenceService.updateLastSeen(req.user.id);
      ResponseHelper.success(res, MESSAGES.USER.LAST_SEEN_UPDATED, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserPresenceController();
