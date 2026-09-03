const jwt = require("jsonwebtoken");
const ResponseHelper = require("../utils/responseHelper");
const HTTP_STATUS = require("../constants/httpStatus");
const MESSAGES = require("../constants/errorMessages");

/**
 * Authentication Middleware - LaporRuta
 * Verifikasi JWT access token dari header Authorization: Bearer <token>
 * Attach req.user: { id, role, assigned_wilayah_id }
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHelper.unauthorized(res, MESSAGES.AUTH.TOKEN_MISSING);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pastikan payload memiliki field yang dibutuhkan
    if (!decoded.sub || !decoded.role) {
      return ResponseHelper.unauthorized(res, MESSAGES.AUTH.TOKEN_INVALID);
    }

    // Normalize payload ke format yang konsisten di seluruh app
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      assigned_wilayah_id: decoded.assigned_wilayah_id || null,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ResponseHelper.error(
        res,
        MESSAGES.AUTH.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (error.name === "JsonWebTokenError") {
      return ResponseHelper.error(
        res,
        MESSAGES.AUTH.TOKEN_INVALID,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    return ResponseHelper.error(
      res,
      MESSAGES.AUTH.UNAUTHORIZED,
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
};

module.exports = authMiddleware;
