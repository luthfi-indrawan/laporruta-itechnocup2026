const Joi = require("joi");
const reportsService = require("../services/reportsService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class ReportsController {
  constructor() {
    this.schemas = {
      create: Joi.object({
        title: Joi.string().max(100).required(),
        description: Joi.string().max(500).required(),
        category_id: Joi.string().uuid().required(),
        wilayah_id: Joi.string().uuid().required(),
        address_text: Joi.string().max(200).required(),
        lat: Joi.number().min(-90).max(90).optional().allow(null),
        lng: Joi.number().min(-180).max(180).optional().allow(null),
      }),
      dispute: Joi.object({
        reason: Joi.string().min(20).max(500).required(),
      }),
    };
  }

  async createReport(req, res, next) {
    try {
      const { error, value } = this.schemas.create.validate(req.body);

      if (error) {
        throw this._validationError(error);
      }

      const result = await reportsService.createReport(
        req.user.id,
        value,
        req.files,
      );

      ResponseHelper.created(res, MESSAGES.REPORT.CREATED, result);
    } catch (error) {
      console.error("[CONTROLLER] error:", error);
      next(error);
    }
  }

  async getMyReports(req, res, next) {
    try {
      const result = await reportsService.getMyReports(req.user.id, req.query);
      ResponseHelper.paginated(res, result.data, result.metadata);
    } catch (error) {
      next(error);
    }
  }

  async getMyReportDetail(req, res, next) {
    try {
      const result = await reportsService.getMyReportDetail(
        req.user.id,
        req.params.id,
      );
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async createDispute(req, res, next) {
    try {
      const { error, value } = this.schemas.dispute.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await reportsService.createDispute(
        req.user.id,
        req.params.id,
        value.reason,
      );
      ResponseHelper.created(res, MESSAGES.REPORT.DISPUTE_SUCCESS, result);
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

module.exports = new ReportsController();
