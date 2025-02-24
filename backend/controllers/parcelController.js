const Item = require("../models/Item");
require("dotenv").config();

// Create Parcel
exports.createParcel = async (req, res) => {
  try {
    const { razorpay_payment_id, trackingDetails, razorpay_order_id, user_id } =
      req.body;
    if (!razorpay_payment_id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const trackingId = `SE-${Date.now()}`;
    const item = new Item({
      ...trackingDetails,
      tracking_id: trackingId,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      user_id,
    });

    await item.save();

    // savetoExcel(parcel);
    console.log("Parcel created successfully", item);
    res.json({
      message: "Parcel created successfully",
      item,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Parcel
exports.getParcel = async (req, res) => {
  try {
    const item = await Item.findOne({ tracking_id: req.params.trackingId });
    if (!item) return res.status(404).send("Parcel not found");
    res.json(item);
  } catch (err) {
    res.status(500).send("Error fetching parcel");
  }
};

// update parcel (delivered)
exports.updateDeliveryStatus = async (req, res) => {
  const { trackingId } = req.params;
  const { delivered , DOD } = req.body;
  
  try {
    const item = await Item.findOneAndUpdate(
      { tracking_id: trackingId },
      { delivered ,
        DOD: delivered ? DOD : "" 
       },
      { new: true } // Return the updated document
    );
    res.json(item);
  } catch (err) {
    res.status(500).send("Error updating delivery status");
  }
};
