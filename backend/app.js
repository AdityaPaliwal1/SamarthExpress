const express = require("express");
const dotenv = require("dotenv");
const getStream = require("get-stream");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const Item = require("./models/Item");
const bodyParser = require("body-parser");
const path = require("path");
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
app.use(express.urlencoded({ extended: true }));

// Middleware
const CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(CorsOptions));
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then((e) => console.log("Connected to MongoDB".green.bold))
  .catch((err) => console.error(err));

// Routes Middleware
app.use("/api/parcels", parcelRoutes); //for booking and tracking
app.use("/api/send-email", emailRoutes); //for sending email
app.use("/api", userRoutes); //for user registration and login

//fetch all parcels
app.use("/api/getAll", async (req, res) => {
  try {
    const allItems = await Item.find();
    res.status(200).json(allItems);
  } catch (err) {
    console.error("Error fetching all parcels:", err);
    res.status(500).send("Error fetching all parcels");
  }
});

//Api for UserReports
app.use("/api/getparcels/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const items = await Item.find({ user_id });
    if (!items || items.length === 0) {
      return res.status(404).json({ message: "No parcels found" });
    }
    res.status(200).json({ parcels: items }); // Ensure response structure
  } catch (err) {
    console.error("Error fetching parcels:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//fetch razorpay key
app.use("/api/razorpay-key", async (req, res) => {
  try {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).send("Error fetching Razorpay key");
  }
});

app.use("/api/payment/order", async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).send("Error creating Razorpay order");
  }
});

// display receipt
app.get("/api/receipt/:trackingId", async (req, res) => {
  try {
    const { trackingId } = req.params;
    const item = await Item.findOne({ tracking_id: trackingId });

    if (!item) {
      return res.status(404).send("Parcel not found");
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfBuffer = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="receipt-${trackingId}.pdf"`
      );
      res.send(pdfBuffer);
    });

    // Add Logo
    const logoPath = "./delivery.png";
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 80 }).moveDown();
    }

    // Company Title
    doc
      .fontSize(25)
      .fillColor("blue")
      .text("Samarth Express", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(12)
      .fillColor("navy")
      .text("Your Trusted Logistic Partner", { align: "center" })
      .moveDown(1);

    // Title
    doc
      .fontSize(16)
      .fillColor("black")
      .text("Receipt for Parcel Booking", { align: "center", underline: true })
      .moveDown();

    // Horizontal Line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

    // Parcel Details (Table-like Structure)
    const addDetail = (label, value) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(label + ":", { continued: true })
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(12)
        .text(` ${value}`, { align: "right" })
        .moveDown(0.5);
    };

    addDetail("Tracking ID", item.tracking_id);
    addDetail("Payment ID", item.payment_id);
    addDetail("Order ID", item.order_id);
    addDetail("Sender Name", item.sender_name);
    addDetail("Sender Phone", item.sender_phone);
    addDetail("Sender City", item.sender_city);
    addDetail("Sender Address", item.sender_address);
    addDetail("Receiver Name", item.receiver_name);
    addDetail("Receiver Phone", item.receiver_phone);
    addDetail("Receiver City", item.receiver_city);
    addDetail("Receiver Address", item.receiver_address);
    addDetail("Weight", `${item.weight} kg`);
    addDetail("Parcel Type", item.parcel_type);
    addDetail("Declared Value", `₹${item.declared_value}`);
    addDetail("Description", item.description);
    addDetail("Booked Time", item.created_at.toLocaleString());

    // Add a footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Thank you for choosing Samarth Express. Safe and reliable delivery!",
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).send("Error generating receipt");
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.yellow);
});
