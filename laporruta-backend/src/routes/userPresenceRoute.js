const express = require("express");
const UserPresenceController = require("../controllers/UserPresenceController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.patch(
  "/last-seen",
  authMiddleware,
  UserPresenceController.updateLastSeen.bind(UserPresenceController),
);

module.exports = router;
