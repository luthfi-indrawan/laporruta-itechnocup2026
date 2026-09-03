const Joi = require("joi");
const masterService = require("../services/masterService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class MasterController {
  constructor() {
    this.schemas = {
      wilayahQuery: Joi.object({
        type: Joi.string()
          .valid("provinsi", "kota", "kecamatan", "kelurahan")
          .optional(),
        parent_id: Joi.string().uuid().optional().allow(""),
      }).optional(),
    };
  }

  async getCategories(req, res, next) {
    try {
      const categories = await masterService.getCategories();
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, categories);
    } catch (error) {
      next(error);
    }
  }

  async getWilayah(req, res, next) {
    try {
      const { error, value } = this.schemas.wilayahQuery.validate(req.query);
      if (error) {
        const err = new Error("Validasi gagal");
        err.statusCode = 400;
        err.details = error.details;
        throw err;
      }

      const wilayah = await masterService.getWilayah(value);
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, wilayah);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MasterController();
