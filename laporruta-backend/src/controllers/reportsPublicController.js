const Joi = require("joi");
const reportsPublicService = require("../services/reportsPublicService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class ReportsPublicController {
  constructor() {
    this.schemas = {
      listQuery: Joi.object({
        status: Joi.string().optional(),
        category_id: Joi.string().optional(),
        wilayah_id: Joi.string().uuid().optional(),
        date_from: Joi.date().iso().optional(),
        date_to: Joi.date().iso().optional(),
        keyword: Joi.string().max(100).optional(),
        lat: Joi.number().min(-90).max(90).optional(),
        lng: Joi.number().min(-180).max(180).optional(),
        radius: Joi.number().integer().max(50000).optional(),
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
      }),
      nearbyQuery: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        category_id: Joi.string().uuid().required(),
        radius: Joi.number().integer().optional(),
        days: Joi.number().integer().optional(),
      }),
    };
  }

  async getPublicReports(req, res, next) {
    try {
      const { error, value } = this.schemas.listQuery.validate(req.query);
      if (error) throw this._validationError(error);

      const result = await reportsPublicService.getPublicReports(value);
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result.data);
    } catch (error) {
      next(error);
    }
  }

  async getPublicReportDetail(req, res, next) {
    try {
      const report = await reportsPublicService.getPublicReportDetail(
        req.params.id,
      );
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, report);
    } catch (error) {
      next(error);
    }
  }

  async getNearby(req, res, next) {
    try {
      const { error, value } = this.schemas.nearbyQuery.validate(req.query);
      if (error) throw this._validationError(error);

      const result = await reportsPublicService.getNearby(value);
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
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

module.exports = new ReportsPublicController();
