const Joi = require("joi");
const userMgmtService = require("../services/userMgmtService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class UserMgmtController {
  constructor() {
    this.schemas = {
      createInvitation: Joi.object({
        email: Joi.string().email().required(),
        role: Joi.string().valid("admin_wilayah", "admin_pusat").required(),
        assigned_wilayah_id: Joi.string()
          .uuid()
          .when("role", {
            is: "admin_wilayah",
            then: Joi.required(),
            otherwise: Joi.optional().allow(null),
          }),
      }),
      toggleStatus: Joi.object({
        is_active: Joi.boolean().required(),
      }),
      reassignZone: Joi.object({
        wilayah_id: Joi.string().uuid().required(),
      }),
    };
  }

  async getAdminList(req, res, next) {
    try {
      const result = await userMgmtService.getAdminList(req.query);
      ResponseHelper.paginated(res, result.data, {
        current_page: parseInt(req.query.page, 10) || 1,
        page_size: parseInt(req.query.limit, 10) || 20,
        total_pages: Math.ceil(
          result.total / (parseInt(req.query.limit, 10) || 20),
        ),
        total_items: result.total,
        has_next_page:
          (parseInt(req.query.page, 10) || 1) <
          Math.ceil(result.total / (parseInt(req.query.limit, 10) || 20)),
        has_prev_page: (parseInt(req.query.page, 10) || 1) > 1,
      });
    } catch (error) {
      next(error);
    }
  }

  async createInvitation(req, res, next) {
    try {
      const { error, value } = this.schemas.createInvitation.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await userMgmtService.createInvitation(req.user.id, value);
      ResponseHelper.created(res, MESSAGES.ADMIN.INVITATION_CREATED, result);
    } catch (error) {
      next(error);
    }
  }

  async getInvitations(req, res, next) {
    try {
      const result = await userMgmtService.getInvitations(req.query);
      ResponseHelper.paginated(res, result.data, {
        current_page: parseInt(req.query.page, 10) || 1,
        page_size: parseInt(req.query.limit, 10) || 20,
        total_pages: Math.ceil(
          result.total / (parseInt(req.query.limit, 10) || 20),
        ),
        total_items: result.total,
        has_next_page:
          (parseInt(req.query.page, 10) || 1) <
          Math.ceil(result.total / (parseInt(req.query.limit, 10) || 20)),
        has_prev_page: (parseInt(req.query.page, 10) || 1) > 1,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleAdminStatus(req, res, next) {
    try {
      const { error, value } = this.schemas.toggleStatus.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await userMgmtService.toggleAdminStatus(
        req.params.id,
        value.is_active,
      );
      ResponseHelper.success(res, MESSAGES.ADMIN.STATUS_TOGGLED, result);
    } catch (error) {
      next(error);
    }
  }

  async reassignAdminZone(req, res, next) {
    try {
      const { error, value } = this.schemas.reassignZone.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await userMgmtService.reassignAdminZone(
        req.params.id,
        value.wilayah_id,
      );
      ResponseHelper.success(res, MESSAGES.ADMIN.ZONE_REASSIGNED, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteAdmin(req, res, next) {
    try {
      await userMgmtService.deleteAdmin(req.params.id);
      ResponseHelper.success(res, MESSAGES.GENERIC.DELETED);
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

module.exports = new UserMgmtController();
