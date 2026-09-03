const ResponseHelper = require("../utils/responseHelper");
const HTTP_STATUS = require("../constants/httpStatus");

/**
 * Global Error Handler - LaporRuta
 * Format response: { code, message, error }
 * Urutan penanganan: PostgreSQL errors → Validation → Custom → Default 500
 */
const errorHandler = (err, req, res, next) => {
  console.error("[ErrorHandler]", err);

  // PostgreSQL unique violation (23505)
  if (err.code === "23505") {
    return ResponseHelper.conflict(
      res,
      "Data sudah ada",
      err.detail || "Duplicate entry",
    );
  }

  // PostgreSQL foreign key violation (23503)
  if (err.code === "23503") {
    return ResponseHelper.badRequest(
      res,
      "Data referensi tidak ditemukan",
      err.detail,
    );
  }

  // PostgreSQL check constraint violation (23514)
  if (err.code === "23514") {
    return ResponseHelper.badRequest(
      res,
      "Validasi constraint gagal",
      err.detail,
    );
  }

  // PostgreSQL not null violation (23502)
  if (err.code === "23502") {
    return ResponseHelper.badRequest(
      res,
      "Field wajib tidak boleh kosong",
      err.detail,
    );
  }

  // Joi / Zod / Custom validation error
  if (
    err.name === "ValidationError" ||
    err.statusCode === HTTP_STATUS.BAD_REQUEST
  ) {
    return ResponseHelper.badRequest(
      res,
      err.message || "Validasi gagal",
      err.error || err.details || null,
    );
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return ResponseHelper.badRequest(
      res,
      "Ukuran file melebihi batas maksimum 5MB",
      null,
    );
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return ResponseHelper.badRequest(
      res,
      "Jumlah file melebihi batas maksimum",
      null,
    );
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return ResponseHelper.badRequest(
      res,
      "Field file tidak sesuai yang diharapkan",
      null,
    );
  }

  // Not found (404)
  if (err.statusCode === HTTP_STATUS.NOT_FOUND) {
    return ResponseHelper.notFound(res, err.message);
  }

  // Unauthorized (401)
  if (err.statusCode === HTTP_STATUS.UNAUTHORIZED) {
    return ResponseHelper.unauthorized(res, err.message);
  }

  // Forbidden (403)
  if (err.statusCode === HTTP_STATUS.FORBIDDEN) {
    return ResponseHelper.forbidden(res, err.message);
  }

  // Conflict (409)
  if (err.statusCode === HTTP_STATUS.CONFLICT) {
    return ResponseHelper.conflict(res, err.message, err.error);
  }

  // Unprocessable Entity (422)
  if (err.statusCode === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    return ResponseHelper.error(
      res,
      err.message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      err.error,
    );
  }

  // Default: 500 Internal Server Error
  const isDev = process.env.NODE_ENV === "development";
  return ResponseHelper.error(
    res,
    isDev ? err.message : "Terjadi kesalahan pada server",
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isDev ? err.stack : null,
  );
};

module.exports = errorHandler;
