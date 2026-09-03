const ResponseHelper = require("../utils/responseHelper");
const HTTP_STATUS = require("../constants/httpStatus");
const MESSAGES = require("../constants/errorMessages");

/**
 * Role-Based Access Control (RBAC) Middleware - LaporRuta
 * @param  {...string} allowedRoles - daftar role yang diizinkan
 *   Contoh: roleMiddleware("user") | roleMiddleware("admin_wilayah", "admin_pusat")
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, MESSAGES.AUTH.UNAUTHORIZED);
      }

      if (!allowedRoles.includes(req.user.role)) {
        return ResponseHelper.forbidden(res, MESSAGES.AUTH.FORBIDDEN);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = roleMiddleware;
