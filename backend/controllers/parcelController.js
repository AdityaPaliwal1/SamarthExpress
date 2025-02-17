const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
// const Parcel = require("../models/Parcel");
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

// const savetoExcel = async (parcel) => {
//   const date = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
//   const excelDir = path.join(__dirname, "../excel"); // Excel folder path
//   const filePath = path.join(excelDir, `parcels_${date}.xlsx`);

//   // ✅ Ensure the 'excel' directory exists
//   if (!fs.existsSync(excelDir)) {
//     fs.mkdirSync(excelDir, { recursive: true }); // Create folder if missing
//   }

//   let data = [];

//   // 🛠️ Check if file exists and read data
//   if (fs.existsSync(filePath)) {
//     const workbook = XLSX.readFile(filePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     data = XLSX.utils.sheet_to_json(sheet);
//   }

//   // 📌 Append new data
//   data.push({
//     "Tracking ID": parcel.tracking_id,
//     "Sender Name": parcel.sender_name,
//     "Receiver Name": parcel.receiver_name,
//     "Sender City": parcel.sender_city,
//     "Receiver City": parcel.receiver_city,
//     "Parcel Type": parcel.parcel_type,
//     "Declared Value": parcel.declared_value,
//     "Payment ID": parcel.payment_id,
//     "Order ID": parcel.order_id,
//     Date: new Date().toLocaleString(),
//   });

//   // 📝 Write updated data back to Excel
//   const newWorkbook = XLSX.utils.book_new();
//   const newSheet = XLSX.utils.json_to_sheet(data);
//   XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Parcels");
//   XLSX.writeFile(newWorkbook, filePath);

//   console.log(`✅ Parcel data saved to ${filePath}`);
// };

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
  const { delivered } = req.body;

  try {
    const item = await Item.findOneAndUpdate(
      { tracking_id: trackingId },
      { delivered },
      { new: true } // Return the updated document
    );
    res.json(item);
  } catch (err) {
    res.status(500).send("Error updating delivery status");
  }
};

