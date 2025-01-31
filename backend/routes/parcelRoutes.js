const express = require("express");
const { createParcel, getParcel, generateReceipt, getAllParcels, updateDeliveryStatus, getRazorpayKey } = require("../controllers/parcelController");

const router = express.Router();

router.post("/", createParcel); // Create a new parcel
router.get("/:trackingId", getParcel); // Get parcel details by tracking ID
router.get("/receipt/:trackingId", generateReceipt);  // Generate a receipt for a parcel
router.patch("/:trackingId/delivery", updateDeliveryStatus); // Use PATCH instead of PUT


module.exports = router;
