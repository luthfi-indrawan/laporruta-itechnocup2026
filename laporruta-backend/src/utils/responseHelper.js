/**
 * Response Helper - LaporRuta
 * Format response sesuai API Contract:
 *   Success: { code, message, result }
 *   Error:   { code, message, error }
 */

const HTTP_STATUS = require("../constants/httpStatus");

class ResponseHelper {
  /**
   * Success response
   * @param {Response} res - Express response object
   * @param {string} message
   * @param {any} result
   * @param {number} statusCode
   */
  static success(
    res,
    message = "successfully",
    result = null,
    statusCode = HTTP_STATUS.OK,
  ) {
    const response = {
      code: statusCode,
      message,
      result: result !== undefined ? result : null,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Created response (201)
   * @param {Response} res
   * @param {string} message
   * @param {any} result
   */
  static created(res, message = "Resource berhasil dibuat", result = null) {
    return this.success(res, message, result, HTTP_STATUS.CREATED);
  }

  /**
   * No content response (204)
   * @param {Response} res
   */
  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Error response
   * @param {Response} res
   * @param {string} message
   * @param {number} statusCode
   * @param {any} errorDetail
   */
  static error(
    res,
    message = "Terjadi kesalahan pada server",
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorDetail = null,
  ) {
    const response = {
      code: statusCode,
      message,
      error: errorDetail,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Bad request (400)
   * @param {Response} res
   * @param {string} message
   * @param {any} errorDetail
   */
  static badRequest(
    res,
    message = "Permintaan tidak valid",
    errorDetail = null,
  ) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errorDetail);
  }

  /**
   * Unauthorized (401)
   * @param {Response} res
   * @param {string} message
   */
  static unauthorized(res, message = "Tidak terautentikasi") {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Forbidden (403)
   * @param {Response} res
   * @param {string} message
   */
  static forbidden(res, message = "Akses ditolak") {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Not found (404)
   * @param {Response} res
   * @param {string} message
   */
  static notFound(res, message = "Data tidak ditemukan") {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Conflict (409)
   * @param {Response} res
   * @param {string} message
   * @param {any} errorDetail
   */
  static conflict(res, message = "Konflik data", errorDetail = null) {
    return this.error(res, message, HTTP_STATUS.CONFLICT, errorDetail);
  }

  /**
   * Pagination response
   * @param {Response} res
   * @param {Array} data
   * @param {Object} metadata { current_page, page_size, total_pages, total_items, has_next_page, has_prev_page }
   * @param {string} message
   */
  static paginated(res, data, metadata, message = "successfully") {
    return this.success(res, message, { data, metadata });
  }
}

module.exports = ResponseHelper;
