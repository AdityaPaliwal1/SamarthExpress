const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  sender_name: String,
  sender_phone: String,
  sender_address: String,
  sender_city: String,
  receiver_name: String,
  receiver_phone: String,
  receiver_address: String,
  receiver_city: String,
  weight: Number,
  declared_value: Number,
  parcel_type: String,
  description: String,
  tracking_id: { type: String, unique: true },
  created_at: { type: Date, default: new Date() },
  order_id: { type: String, unique: true, default: "" },
  user_id: { type: String},
  payment_id: { type: String, unique: true },
  delivered: { type: Boolean, default: false },
});

module.exports = mongoose.model("Items", ItemSchema);
