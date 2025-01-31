const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Parcel = require("./models/Parcel");
const bodyParser = require("body-parser");
const cors = require("cors");
const razorpay = require("./utils/razorpay");
require("colors");

// Import Routes
const parcelRoutes = require("./routes/parcelRoutes");
const emailRoutes = require("./routes/emailRoutes");
const userRoutes = require("./routes/userRoutes");


// Initialize App
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then((e) => console.log("Connected to MongoDB".green.bold))
  .catch((err) => console.error(err).red);

// Routes Middleware
app.use("/api/parcels", parcelRoutes); //for booking and tracking
app.use("/api/send-email", emailRoutes); //for sending email
app.use("/api", userRoutes); //for user registration and login




app.use("/api/getAll", async (req, res) => {
  try {
    const allParcels = await Parcel.find();
    res.status(200).json(allParcels);
  } catch (err) {
    console.error("Error fetching all parcels:", err);
    res.status(500).send("Error fetching all parcels");
  }
});

app.use("/api/razorpay-key", async (req, res) => {
  try {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).send("Error fetching Razorpay key");
  }
}
);


app.use ("/api/payment/order" , async(req,res)=>{
  try{
    const amount = req.body.declared_value * 100; // Convert to paise
    const currency = "INR";

    const options = {
      amount: amount,
      currency: currency,
      receipt: `SE-${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      order_id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
    });
  }
  catch(err){
    console.error("Error creating Razorpay order:", err);
    res.status(500).send("Error creating Razorpay order");
  }
})

app.get("/api/receipt/:trackingId", async (req, res) => {
  const { trackingId } = req.params;
  // Fetch the parcel details using the trackingId
  const parcel = await Parcel.findOne({ tracking_id: trackingId });
  if (!parcel) {
    return res.status(404).send("Parcel not found");
  }
  // Create a PDF document
  const doc = new PDFDocument();
  // Set the response headers to indicate a file download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="receipt-${trackingId}.pdf"`
  );

  // Pipe the PDF to the response stream
  doc.pipe(res);
  // Add content to the PDF
  doc.fontSize(20).text(`Receipt for Parcel Booking`, { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Tracking ID: ${parcel.tracking_id}`);
  doc.text(`Sender Name: ${parcel.sender_name}`);
  doc.text(`Sender Phone: ${parcel.sender_phone}`);
  doc.text(`Sender City : ${parcel.sender_city}`);
  doc.text(`Sender Address: ${parcel.sender_address}`);
  doc.text(`Receiver Name: ${parcel.receiver_name}`);
  doc.text(`Receiver Phone: ${parcel.receiver_phone}`);
  doc.text(`Receiver City: ${parcel.receiver_city}`);
  doc.text(`Receiver Address: ${parcel.receiver_address}`);
  doc.text(`Weight: ${parcel.weight} kg`);
  doc.text(`Parcel Type: ${parcel.parcel_type}`);
  doc.text(`Declared Value: ₹${parcel.declared_value}`);
  doc.text(`Description: ${parcel.description}`);
  doc.text(`Booked Time: ${parcel.created_at}`);
  // Finalize the PDF
  doc.end();
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.yellow));
