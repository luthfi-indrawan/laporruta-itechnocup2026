const express = require("express");
const ReportsController = require("../controllers/reportsController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  uploadMultiple,
  validateMagicNumberMiddleware,
} = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  uploadMultiple,
  validateMagicNumberMiddleware,
  ReportsController.createReport.bind(ReportsController),
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("user"),
  ReportsController.getMyReports.bind(ReportsController),
);
router.get(
  "/my/:id",
  authMiddleware,
  roleMiddleware("user"),
  ReportsController.getMyReportDetail.bind(ReportsController),
);
router.post(
  "/:id/dispute",
  authMiddleware,
  roleMiddleware("user"),
  ReportsController.createDispute.bind(ReportsController),
);

module.exports = router;
