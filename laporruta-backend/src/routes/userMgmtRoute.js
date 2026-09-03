const express = require("express");
const UserMgmtController = require("../controllers/userMgmtController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
  "/admins",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  UserMgmtController.getAdminList.bind(UserMgmtController),
);
router.post(
  "/invitations",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  UserMgmtController.createInvitation.bind(UserMgmtController),
);
router.get(
  "/invitations",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  UserMgmtController.getInvitations.bind(UserMgmtController),
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  UserMgmtController.toggleAdminStatus.bind(UserMgmtController),
);
router.put(
  "/:id/zone",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  UserMgmtController.reassignAdminZone.bind(UserMgmtController),
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin_pusat"),
  UserMgmtController.deleteAdmin.bind(UserMgmtController),
);

module.exports = router;
