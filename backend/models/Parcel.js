const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema({
  sender_name: String,
  sender_phone: String,
  sender_address: String,
  receiver_name: String,
  receiver_phone: String,
  receiver_address: String,
  weight: Number,
  declared_value: Number,
  description: String,
  tracking_id: { type: String, unique: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Parcel", parcelSchema);
