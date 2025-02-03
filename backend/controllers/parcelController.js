const Parcel = require("../models/Parcel");
require("dotenv").config();
// Create Parcel
exports.createParcel = async (req, res) => {
  try {
    const { razorpay_payment_id, trackingDetails } = req.body;
    if (!razorpay_payment_id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }
    const trackingId = `SE-${Date.now()}`;
    const parcel = new Parcel({
      ...trackingDetails,
      tracking_id: trackingId,
      payment_id: razorpay_payment_id,
    });
    await parcel.save();
    res.json({
      message: "Parcel created successfully",
      parcel,
    });
  } catch (err) {
    res.status(500).send("Error creating parcel");
  }
};

// Get Parcel
exports.getParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({ tracking_id: req.params.trackingId });
    if (!parcel) return res.status(404).send("Parcel not found");
    res.json(parcel);
  } catch (err) {
    res.status(500).send("Error fetching parcel");
  }
};

// update parcel (delivered)
exports.updateDeliveryStatus = async (req, res) => {
  const { trackingId } = req.params;
  const { delivered } = req.body;

  try {
    const parcel = await Parcel.findOneAndUpdate(
      { tracking_id: trackingId },
      { delivered },
      { new: true } // Return the updated document
    );
    res.json(parcel);
  } catch (err) {
    res.status(500).send("Error updating delivery status");
  }
};

// Generate PDF Receipt

