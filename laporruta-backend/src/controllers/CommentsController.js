const Joi = require("joi");
const commentsService = require("../services/commentsService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class CommentsController {
  constructor() {
    this.schemas = {
      create: Joi.object({
        text: Joi.string().max(500).required(),
      }),
    };
  }

  async getComments(req, res, next) {
    try {
      const result = await commentsService.getComments(
        req.params.id,
        req.query,
      );
      ResponseHelper.paginated(res, result.data, result.metadata);
    } catch (error) {
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const { error, value } = this.schemas.create.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await commentsService.createComment(
        req.user.id,
        req.params.id,
        value.text,
      );
      ResponseHelper.created(res, MESSAGES.COMMENT.CREATED, result);
    } catch (error) {
      next(error);
    }
  }

  _validationError(error) {
    const err = new Error("Validasi gagal");
    err.statusCode = 400;
    err.details = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message,
    }));
    return err;
  }
}

module.exports = new CommentsController();
