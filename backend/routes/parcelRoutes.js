const express = require("express");
const {
  createParcel,
  getParcel,
  updateDeliveryStatus,
  getUserParcels,
} = require("../controllers/parcelController");

const router = express.Router();

router.post("/", createParcel); // Create a new parcel
router.get("/:trackingId", getParcel); // Get parcel details by tracking ID //
router.patch("/:trackingId/delivery", updateDeliveryStatus); // Use PATCH instead of PUT


module.exports = router;
