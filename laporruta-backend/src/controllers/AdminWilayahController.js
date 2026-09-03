const Joi = require("joi");
const adminWilayahService = require("../services/AdminWilayahService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class AdminWilayahController {
  constructor() {
    this.schemas = {
      reject: Joi.object({
        rejection_reason: Joi.string().min(10).max(500).required(),
      }),
      updateStatus: Joi.object({
        status: Joi.string().valid("in_progress", "resolved").required(),
        note: Joi.string().max(500).optional().allow(""),
      }),
      createNote: Joi.object({
        note: Joi.string().max(500).required(),
      }),
    };
  }

  async getReports(req, res, next) {
    try {
      const result = await adminWilayahService.getReports(
        req.user.assigned_wilayah_id,
        req.query,
      );
      ResponseHelper.paginated(res, result.data, result.metadata);
    } catch (error) {
      next(error);
    }
  }

  async getPendingReports(req, res, next) {
    try {
      const result = await adminWilayahService.getPendingReports(
        req.user.assigned_wilayah_id,
      );
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async getReportDetail(req, res, next) {
    try {
      const result = await adminWilayahService.getReportDetail(
        req.params.id,
        req.user.assigned_wilayah_id,
      );
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async verifyReport(req, res, next) {
    try {
      const result = await adminWilayahService.verifyReport(
        req.params.id,
        req.user.id,
        req.user.assigned_wilayah_id,
      );
      ResponseHelper.success(res, MESSAGES.REPORT.VERIFY_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async rejectReport(req, res, next) {
    try {
      const { error, value } = this.schemas.reject.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await adminWilayahService.rejectReport(
        req.params.id,
        req.user.id,
        req.user.assigned_wilayah_id,
        value.rejection_reason,
      );
      ResponseHelper.success(res, MESSAGES.REPORT.REJECT_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { error, value } = this.schemas.updateStatus.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await adminWilayahService.updateStatus(
        req.params.id,
        req.user.id,
        req.user.assigned_wilayah_id,
        value,
      );
      ResponseHelper.success(res, MESSAGES.REPORT.STATUS_UPDATED, result);
    } catch (error) {
      next(error);
    }
  }

  async uploadAfterImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        const err = new Error(MESSAGES.FILE.NO_FILE);
        err.statusCode = 400;
        throw err;
      }

      const result = await adminWilayahService.uploadAfterImages(
        req.params.id,
        req.user.id,
        req.user.assigned_wilayah_id,
        req.files,
      );
      ResponseHelper.created(res, MESSAGES.ADMIN.AFTER_IMAGE_UPLOADED, result);
    } catch (error) {
      next(error);
    }
  }

  async createNote(req, res, next) {
    try {
      const { error, value } = this.schemas.createNote.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await adminWilayahService.createNote(
        req.params.id,
        req.user.id,
        req.user.assigned_wilayah_id,
        value.note,
      );
      ResponseHelper.created(res, MESSAGES.ADMIN.NOTE_CREATED, result);
    } catch (error) {
      next(error);
    }
  }

  async getNotes(req, res, next) {
    try {
      const result = await adminWilayahService.getNotes(
        req.params.id,
        req.user.assigned_wilayah_id,
      );
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

module.exports = new AdminWilayahController();
