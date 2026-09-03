const upvotesService = require("../services/UpvotesService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class UpvotesController {
  async toggleUpvote(req, res, next) {
    try {
      const result = await upvotesService.toggleUpvote(
        req.user.id,
        req.params.id,
      );
      ResponseHelper.success(res, MESSAGES.UPVOTE.TOGGLE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async getUpvoteCount(req, res, next) {
    try {
      const result = await upvotesService.getUpvoteCount(req.params.id);
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UpvotesController();
