const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const ResponseHelper = require("../utils/responseHelper");

/**
 * Upload Middleware - LaporRuta
 * Validasi: MIME type, magic number, file size, filename sanitization
 * Backend proxy: client upload ke Express → Express upload ke Supabase
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 3;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);

const MAGIC_NUMBERS = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
};

/**
 * Validasi magic number (file signature) dari buffer
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {boolean}
 */
const validateMagicNumber = (buffer, mimeType) => {
  const signature = MAGIC_NUMBERS[mimeType];
  if (!signature || !buffer) return false;
  return signature.every((byte, i) => buffer[i] === byte);
};

/**
 * Generate safe filename: UUID + timestamp + .jpg/.png
 * Original filename tidak pernah digunakan
 * @param {string} originalMimeType
 * @returns {string}
 */
const generateSafeFilename = (originalMimeType) => {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  const ext = originalMimeType === "image/png" ? ".png" : ".jpg";
  return `${uuid}_${timestamp}${ext}`;
};

/**
 * Multer storage: memory (buffer) untuk diproses Sharp sebelum upload ke Supabase
 */
const storage = multer.memoryStorage();

/**
 * Multer file filter: MIME type validation
 */
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const error = new Error("Hanya file JPEG dan PNG yang diizinkan");
    error.statusCode = 400;
    error.code = "INVALID_FILE_TYPE";
    return cb(error, false);
  }
  cb(null, true);
};

// Single File Upload
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// Multiple Files Upload (max 3)
const uploadMultiple = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("[Upload] file received:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    fileFilter(req, file, cb);
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

/**
 * Middleware: Magic number validation setelah multer parsing
 * Dipasang SETELAH multer middleware
 */
const validateMagicNumberMiddleware = (req, res, next) => {
  console.log("[Upload] validateMagicNumber START");

  try {
    const files = req.files || [req.file];

    console.log("[Upload] files:", files?.length);
    console.log("[Upload] body:", req.body);

    if (!files || files.length === 0 || !files[0]) {
      console.log("[Upload] No files, next()");
      return next();
    }

    for (const file of files) {
      console.log("[Upload] Validating:", {
        mimetype: file.mimetype,
        size: file.size,
      });

      if (!validateMagicNumber(file.buffer, file.mimetype)) {
        console.log("[Upload] Invalid magic number");

        return ResponseHelper.badRequest(
          res,
          "Format file tidak valid. File mungkin corrupt atau bukan gambar asli.",
        );
      }

      file.safeFilename = generateSafeFilename(file.mimetype);
    }

    console.log("[Upload] Validation passed");

    next();
  } catch (error) {
    console.error("[Upload] Error:", error);
    next(error);
  }
};

/**
 * Middleware: Check minimal 1 file ada (untuk endpoint wajib upload)
 */
const requireFiles = (req, res, next) => {
  const files = req.files || [req.file];
  if (!files || files.length === 0 || !files[0]) {
    return ResponseHelper.badRequest(res, "Tidak ada file yang diunggah");
  }
  next();
};

module.exports = {
  // Multer instances
  uploadSingle: uploadSingle.single("image"),
  uploadMultiple: uploadMultiple.array("images", MAX_FILES),
  uploadMixed: uploadMultiple.fields([{ name: "images", maxCount: MAX_FILES }]),

  // Post-upload validators
  validateMagicNumberMiddleware: validateMagicNumberMiddleware,
  requireFiles,

  // Config exports (untuk reference di service layer)
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_MIME_TYPES,
  generateSafeFilename,
  validateMagicNumber,
};
