const ResponseHelper = require("../utils/responseHelper");

/**
 * Validation Middleware - LaporRuta
 * Wrapper untuk Joi / Zod schema validation
 * Format error sesuai API Contract: { code, message, error: [{ field, message }] }
 *
 * Usage dengan Joi:
 *   const Joi = require("joi");
 *   const schema = Joi.object({ ... });
 *   router.post("/", validate(schema), controller);
 *
 * Usage dengan Zod:
 *   const { z } = require("zod");
 *   const schema = z.object({ ... });
 *   router.post("/", validate(schema), controller);
 */

const validate = (schema) => {
  return (req, res, next) => {
    try {
      let validationResult;

      // Support Joi
      if (schema.validate) {
        validationResult = schema.validate(req.body, { abortEarly: false });

        if (validationResult.error) {
          const errors = validationResult.error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          }));

          return ResponseHelper.badRequest(res, "Validasi gagal", errors);
        }

        // Joi: replace req.body dengan value yang sudah di-coerce
        req.body = validationResult.value;
        return next();
      }

      // Support Zod
      if (schema.parse || schema.safeParse) {
        const result = schema.safeParse
          ? schema.safeParse(req.body)
          : { success: false, error: null }; // fallback

        if (!result.success) {
          const errors = result.error?.issues?.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })) || [{ field: "unknown", message: "Validasi gagal" }];

          return ResponseHelper.badRequest(res, "Validasi gagal", errors);
        }

        // Zod: replace req.body dengan parsed data
        req.body = result.data;
        return next();
      }

      // Schema tidak dikenali
      return ResponseHelper.error(res, "Schema validasi tidak valid", 500);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validation middleware untuk query parameters
 * @param {Object} schema - Joi/Zod schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.validate) {
        const { error, value } = schema.validate(req.query, {
          abortEarly: false,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          }));

          return ResponseHelper.badRequest(res, "Validasi query gagal", errors);
        }

        req.query = value;
        return next();
      }

      if (schema.safeParse) {
        const result = schema.safeParse(req.query);

        if (!result.success) {
          const errors = result.error?.issues?.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })) || [{ field: "unknown", message: "Validasi query gagal" }];

          return ResponseHelper.badRequest(res, "Validasi query gagal", errors);
        }

        req.query = result.data;
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validation middleware untuk URL parameters
 * @param {Object} schema - Joi/Zod schema
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.validate) {
        const { error, value } = schema.validate(req.params, {
          abortEarly: false,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          }));

          return ResponseHelper.badRequest(
            res,
            "Validasi parameter gagal",
            errors,
          );
        }

        req.params = value;
        return next();
      }

      if (schema.safeParse) {
        const result = schema.safeParse(req.params);

        if (!result.success) {
          const errors = result.error?.issues?.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })) || [{ field: "unknown", message: "Validasi parameter gagal" }];

          return ResponseHelper.badRequest(
            res,
            "Validasi parameter gagal",
            errors,
          );
        }

        req.params = result.data;
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
};
