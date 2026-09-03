const express = require("express");

const authRoute = require("./authRoute");
const masterRoute = require("./masterRoute");
const reportsPublicRoute = require("./reportsPublicRoute");
const reportsRoute = require("./reportsRoute");
const upvotesRoute = require("./upvotesRoute");
const commentsRoute = require("./commentsRoute");
const uploadsRoute = require("./uploadsRoute");
const adminWilayahRoute = require("./adminWilayahRoute");
const adminPusatRoute = require("./adminPusatRoute");
const userMgmtRoute = require("./userMgmtRoute");
const activityLogsRoute = require("./activityLogsRoute");
const userPresenceRoute = require("./userPresenceRoute");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/master", masterRoute);
router.use("/users", userPresenceRoute);
router.use("/users", userMgmtRoute);
router.use("/uploads", uploadsRoute);
router.use("/reports/public", reportsPublicRoute);
router.use("/reports", reportsRoute);
router.use("/reports/:id/activity-logs", activityLogsRoute);
router.use("/admin/pusat", adminPusatRoute);
router.use("/reports/:id/comments", commentsRoute);
router.use("/admin/users", userMgmtRoute);
router.use("/reports/:id/upvotes", upvotesRoute);
router.use("/admin/wilayah", adminWilayahRoute);

module.exports = router;
