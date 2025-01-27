const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Parcel = require("./models/Parcel");
const bodyParser = require("body-parser");
const cors = require("cors");
require("colors");

// Import Routes
const parcelRoutes = require("./routes/parcelRoutes");
const emailRoutes = require("./routes/emailRoutes");


// Initialize App
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
  })
  .then((e) => console.log("Connected to MongoDB".green.bold))
  .catch((err) => console.error(err).red);

// Routes Middleware
app.use("/api/parcels", parcelRoutes);
// app.use("/api/receipt", parcelRoutes);
app.use("/api/send-email", emailRoutes);


app.get('/api/receipt/:trackingId', async (req, res) => {
  const { trackingId } = req.params;
  // Fetch the parcel details using the trackingId
  const parcel = await Parcel.findOne({ tracking_id: trackingId });
  if (!parcel) {
    return res.status(404).send('Parcel not found');
  }
  // Create a PDF document
  const doc = new PDFDocument();
  // Set the response headers to indicate a file download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${trackingId}.pdf"`);
  
  // Pipe the PDF to the response stream
  doc.pipe(res);
  // Add content to the PDF
  doc.fontSize(20).text(`Receipt for Parcel Booking`, { align: 'center' });
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
