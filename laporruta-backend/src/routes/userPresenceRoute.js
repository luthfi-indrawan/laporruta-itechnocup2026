const express = require("express");
const UserPresenceController = require("../controllers/userPresenceController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.patch(
  "/last-seen",
  authMiddleware,
  UserPresenceController.updateLastSeen.bind(UserPresenceController),
);

module.exports = router;
