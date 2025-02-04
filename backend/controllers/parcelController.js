const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Parcel = require("../models/Parcel");
require("dotenv").config();
// Create Parcel
exports.createParcel = async (req, res) => {
  try {
    const { razorpay_payment_id, trackingDetails, razorpay_order_id } =
      req.body;
    if (!razorpay_payment_id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }
    const trackingId = `SE-${Date.now()}`;
    const parcel = new Parcel({
      ...trackingDetails,
      tracking_id: trackingId,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
    await parcel.save();
    // savetoExcel(parcel);
    res.json({
      message: "Parcel created successfully",
      parcel,
    });
  } catch (err) {
    res.status(500).send("Error creating parcel");
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
