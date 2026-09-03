const express = require("express");
const MasterController = require("../controllers/masterController");

const router = express.Router();

router.get(
  "/categories",
  MasterController.getCategories.bind(MasterController),
);
router.get("/wilayah", MasterController.getWilayah.bind(MasterController));

module.exports = router;
