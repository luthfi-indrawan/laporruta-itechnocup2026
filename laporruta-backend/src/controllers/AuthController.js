const Joi = require("joi");
const authService = require("../services/AuthService");
const jwtHelper = require("../utils/jwtHelper");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

/**
 * Auth Controller - LaporRuta
 * Handle HTTP request/response + input validation
 */
class AuthController {
  constructor() {
    this.schemas = this._defineSchemas();
  }

  _defineSchemas() {
    return {
      register: Joi.object({
        full_name: Joi.string().max(255).required().messages({
          "string.max": "Nama lengkap maksimal 255 karakter",
          "any.required": "Nama lengkap wajib diisi",
        }),
        email: Joi.string().email().max(255).required().messages({
          "string.email": "Format email tidak valid",
          "any.required": "Email wajib diisi",
        }),
        password: Joi.string().min(8).max(100).required().messages({
          "string.min": "Password minimal 8 karakter",
          "string.max": "Password maksimal 100 karakter",
          "any.required": "Password wajib diisi",
        }),
        confirm_password: Joi.string()
          .valid(Joi.ref("password"))
          .required()
          .messages({
            "any.only": "Password tidak cocok",
            "any.required": "Konfirmasi password wajib diisi",
          }),
      }),

      login: Joi.object({
        email: Joi.string().email().required().messages({
          "string.email": "Format email tidak valid",
          "any.required": "Email wajib diisi",
        }),
        password: Joi.string().required().messages({
          "any.required": "Password wajib diisi",
        }),
      }),

      acceptInvitation: Joi.object({
        token: Joi.string().required().messages({
          "any.required": "Token undangan wajib diisi",
        }),
        full_name: Joi.string().max(255).required().messages({
          "string.max": "Nama lengkap maksimal 255 karakter",
          "any.required": "Nama lengkap wajib diisi",
        }),
        password: Joi.string().min(8).max(100).required().messages({
          "string.min": "Password minimal 8 karakter",
          "string.max": "Password maksimal 100 karakter",
          "any.required": "Password wajib diisi",
        }),
        confirm_password: Joi.string()
          .valid(Joi.ref("password"))
          .required()
          .messages({
            "any.only": "Password tidak cocok",
            "any.required": "Konfirmasi password wajib diisi",
          }),
      }),
    };
  }

  _validateBody(body, schema) {
    const { error, value } = schema.validate(body, { abortEarly: false });
    if (error) {
      const err = new Error("Validasi gagal");
      err.statusCode = 400;
      err.name = "ValidationError";
      err.details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      throw err;
    }
    return value;
  }

  async register(req, res, next) {
    try {
      const validated = this._validateBody(req.body, this.schemas.register);

      const result = await authService.register({
        fullName: validated.full_name,
        email: validated.email,
        password: validated.password,
        confirmPassword: validated.confirm_password,
      });

      jwtHelper.setRefreshCookie(res, result.refreshToken);

      ResponseHelper.created(res, MESSAGES.AUTH.REGISTER_SUCCESS, {
        user: result.user,
        access_token: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const validated = this._validateBody(req.body, this.schemas.login);

      const result = await authService.login({
        email: validated.email,
        password: validated.password,
      });

      jwtHelper.setRefreshCookie(res, result.refreshToken);

      ResponseHelper.success(res, MESSAGES.AUTH.LOGIN_SUCCESS, {
        user: result.user,
        access_token: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const rawRefreshToken = req.cookies.refresh_token;

      const result = await authService.refreshToken(rawRefreshToken);

      jwtHelper.setRefreshCookie(res, result.refreshToken);

      ResponseHelper.success(res, MESSAGES.AUTH.REFRESH_SUCCESS, {
        access_token: result.accessToken,
      });
    } catch (error) {
      jwtHelper.clearRefreshCookie(res);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies.refresh_token;

      await authService.logout(rawRefreshToken);

      jwtHelper.clearRefreshCookie(res);

      ResponseHelper.success(res, MESSAGES.AUTH.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getCurrentUser(userId);
      ResponseHelper.success(res, MESSAGES.GENERIC.SUCCESS, user);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req, res, next) {
    try {
      const validated = this._validateBody(
        req.body,
        this.schemas.acceptInvitation,
      );

      const result = await authService.acceptInvitation({
        token: validated.token,
        fullName: validated.full_name,
        password: validated.password,
        confirmPassword: validated.confirm_password,
      });

      jwtHelper.setRefreshCookie(res, result.refreshToken);

      ResponseHelper.created(res, MESSAGES.AUTH.INVITATION_SUCCESS, {
        user: result.user,
        access_token: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
