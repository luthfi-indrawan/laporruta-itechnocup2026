const express = require("express");
const CommentsController = require("../controllers/commentsController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router({ mergeParams: true });

router.get("/", CommentsController.getComments.bind(CommentsController));
router.post(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  CommentsController.createComment.bind(CommentsController),
);

module.exports = router;
