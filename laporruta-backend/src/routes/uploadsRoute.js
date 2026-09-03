const express = require("express");
const UploadsController = require("../controllers/uploadsController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  uploadSingle,
  validateMagicNumberMiddleware,
} = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/images",
  authMiddleware,
  uploadSingle,
  validateMagicNumberMiddleware,
  UploadsController.uploadImage.bind(UploadsController),
);

router.delete(
  "/images",
  authMiddleware,
  UploadsController.deleteImage.bind(UploadsController),
);

module.exports = router;
