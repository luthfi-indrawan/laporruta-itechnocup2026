const express = require("express");
const ReportsPublicController = require("../controllers/reportsPublicController");

const router = express.Router();

router.get(
  "/",
  ReportsPublicController.getPublicReports.bind(ReportsPublicController),
);
router.get(
  "/nearby",
  ReportsPublicController.getNearby.bind(ReportsPublicController),
);
router.get(
  "/:id",
  ReportsPublicController.getPublicReportDetail.bind(ReportsPublicController),
);

module.exports = router;
