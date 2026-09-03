const express = require("express");
const UpvotesController = require("../controllers/upvotesController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  UpvotesController.toggleUpvote.bind(UpvotesController),
);
router.get("/count", UpvotesController.getUpvoteCount.bind(UpvotesController));

module.exports = router;
