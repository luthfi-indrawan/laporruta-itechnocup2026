const Joi = require("joi");
const adminPusatService = require("../services/adminPusatService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class AdminPusatController {
  constructor() {
    this.schemas = {
      overrideStatus: Joi.object({
        status: Joi.string()
          .valid(
            "pending_verification",
            "verified",
            "in_progress",
            "resolved",
            "rejected",
          )
          .required(),
        reason: Joi.string().max(500).optional().allow(""),
      }),
      reassignZone: Joi.object({
        wilayah_id: Joi.string().uuid().required(),
      }),
      editReport: Joi.object({
        title: Joi.string().max(100).optional(),
        description: Joi.string().max(500).optional(),
        category_id: Joi.string().uuid().optional(),
        address_text: Joi.string().max(200).optional(),
      }).min(1),
    };
  }

  async getAllReports(req, res, next) {
    try {
      const result = await adminPusatService.getAllReports(req.query);
      ResponseHelper.paginated(res, result.data, result.metadata);
    } catch (error) {
      next(error);
    }
  }

  async getZonelessReports(req, res, next) {
    try {
      const result = await adminPusatService.getZonelessReports();
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async getReportDetail(req, res, next) {
    try {
      const result = await adminPusatService.getReportDetail(req.params.id);
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async overrideStatus(req, res, next) {
    try {
      const { error, value } = this.schemas.overrideStatus.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await adminPusatService.overrideStatus(
        req.params.id,
        req.user.id,
        value,
      );
      ResponseHelper.success(res, MESSAGES.REPORT.OVERRIDE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async reassignZone(req, res, next) {
    try {
      const { error, value } = this.schemas.reassignZone.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await adminPusatService.reassignZone(
        req.params.id,
        req.user.id,
        value.wilayah_id,
      );
      ResponseHelper.success(res, MESSAGES.REPORT.ZONE_REASSIGNED, result);
    } catch (error) {
      next(error);
    }
  }

  async editReport(req, res, next) {
    try {
      const { error, value } = this.schemas.editReport.validate(req.body);
      if (error) throw this._validationError(error);

      const result = await adminPusatService.editReport(
        req.params.id,
        req.user.id,
        value,
      );
      ResponseHelper.success(res, MESSAGES.GENERIC.UPDATED, result);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const result = await adminPusatService.getStatistics();
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async getHeatmapData(req, res, next) {
    try {
      const result = await adminPusatService.getHeatmapData();
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const rows = await adminPusatService.exportCsv(req.query);

      const headers = [
        "ID",
        "Judul",
        "Deskripsi",
        "Status",
        "Alamat",
        "Lat",
        "Lng",
        "Kategori",
        "Wilayah",
        "Pelapor",
        "Jumlah Upvote",
        "Dibuat",
        "Diperbarui",
      ];

      const csvRows = rows.map((r) =>
        [
          r.id,
          `"${(r.title || "").replace(/"/g, '""')}"`,
          `"${(r.description || "").replace(/"/g, '""')}"`,
          r.status,
          `"${(r.address_text || "").replace(/"/g, '""')}"`,
          r.lat,
          r.lng,
          r.category_name,
          r.wilayah_name,
          r.reporter_name,
          r.upvote_count,
          r.created_at,
          r.updated_at,
        ].join(","),
      );

      const csv = [headers.join(","), ...csvRows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="laporan-${new Date().toISOString().split("T")[0]}.csv"`,
      );
      res.status(200).send(csv);
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

module.exports = new AdminPusatController();
