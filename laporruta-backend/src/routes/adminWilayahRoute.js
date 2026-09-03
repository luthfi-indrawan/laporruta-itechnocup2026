const express = require("express");
const AdminWilayahController = require("../controllers/AdminWilayahController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  authorizeZone,
  injectZoneFilter,
} = require("../middlewares/zoneMiddleware");
const {
  uploadMultiple,
  validateMagicNumber,
  validateMagicNumberMiddleware,
} = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get(
  "/reports",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  injectZoneFilter,
  AdminWilayahController.getReports.bind(AdminWilayahController),
);

router.get(
  "/reports/pending",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  AdminWilayahController.getPendingReports.bind(AdminWilayahController),
);

router.get(
  "/reports/:id",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  authorizeZone,
  AdminWilayahController.getReportDetail.bind(AdminWilayahController),
);

router.patch(
  "/reports/:id/verify",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  authorizeZone,
  AdminWilayahController.verifyReport.bind(AdminWilayahController),
);

router.patch(
  "/reports/:id/reject",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  authorizeZone,
  AdminWilayahController.rejectReport.bind(AdminWilayahController),
);

router.patch(
  "/reports/:id/status",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  authorizeZone,
  AdminWilayahController.updateStatus.bind(AdminWilayahController),
);

router.post(
  "/reports/:id/after-images",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  authorizeZone,
  uploadMultiple,
  validateMagicNumberMiddleware,
  AdminWilayahController.uploadAfterImages.bind(AdminWilayahController),
);

router.post(
  "/reports/:id/notes",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  authorizeZone,
  AdminWilayahController.createNote.bind(AdminWilayahController),
);

router.get(
  "/reports/:id/notes",
  authMiddleware,
  roleMiddleware("admin_wilayah"),
  authorizeZone,
  AdminWilayahController.getNotes.bind(AdminWilayahController),
);

module.exports = router;
