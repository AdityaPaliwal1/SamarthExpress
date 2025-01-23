const express = require("express");
const { createParcel, getParcel, generateReceipt } = require("../controllers/parcelController");

const router = express.Router();

router.post("/", createParcel);
router.get("/:trackingId", getParcel);
router.get("/receipt/:trackingId", generateReceipt);

module.exports = router;
