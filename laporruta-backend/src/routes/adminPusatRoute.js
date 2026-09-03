const express = require("express");
const AdminPusatController = require("../controllers/AdminPusatController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
  "/reports",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.getAllReports.bind(AdminPusatController),
);
router.get(
  "/reports/zoneless",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.getZonelessReports.bind(AdminPusatController),
);
router.get(
  "/reports/:id",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.getReportDetail.bind(AdminPusatController),
);
router.patch(
  "/reports/:id/status",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.overrideStatus.bind(AdminPusatController),
);
router.put(
  "/reports/:id/zone",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.reassignZone.bind(AdminPusatController),
);
router.put(
  "/reports/:id",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.editReport.bind(AdminPusatController),
);
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.getStatistics.bind(AdminPusatController),
);
router.get(
  "/heatmap",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.getHeatmapData.bind(AdminPusatController),
);
router.get(
  "/exports/csv",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  AdminPusatController.exportCsv.bind(AdminPusatController),
);

module.exports = router;
