const express = require("express");
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", AuthController.register.bind(AuthController));
router.post("/login", AuthController.login.bind(AuthController));
router.post("/refresh", AuthController.refresh.bind(AuthController));
router.post(
  "/invitations/accept",
  AuthController.acceptInvitation.bind(AuthController),
);

// Protected routes
router.post(
  "/logout",
  authMiddleware,
  AuthController.logout.bind(AuthController),
);
router.get("/me", authMiddleware, AuthController.me.bind(AuthController));

module.exports = router;
