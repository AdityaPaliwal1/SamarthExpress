const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const getStream = require("get-stream");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

dotenv.config();
app.use(express.urlencoded({ extended: true }));
const _dirname = path.resolve();
// Middleware
const CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then((e) => console.log("Connected to MongoDB".green.bold))
  .catch((err) => console.error(err).red);

// io.on("connection", (socket) => {
//   console.log("A client connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("A client disconnected:", socket.id);
//   });
// });

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
    const doc = new PDFDocument();
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

    // Add content to PDF
    doc.fontSize(20).text(`Receipt for Parcel Booking`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Tracking ID: ${item.tracking_id}`);
    doc.fontSize(12).text(`Payment ID: ${item.payment_id}`);
    doc.fontSize(12).text(`Order ID: ${item.order_id}`);
    doc.text(`Sender Phone: ${item.sender_phone}`);
    doc.text(`Sender City : ${item.sender_city}`);
    doc.text(`Sender Address: ${item.sender_address}`);
    doc.text(`Receiver Name: ${item.receiver_name}`);
    doc.text(`Receiver Phone: ${item.receiver_phone}`);
    doc.text(`Receiver City: ${item.receiver_city}`);
    doc.text(`Receiver Address: ${item.receiver_address}`);
    doc.text(`Weight: ${item.weight} kg`);
    doc.text(`Parcel Type: ${item.parcel_type}`);
    doc.text(`Declared Value: ₹${item.declared_value}`);
    doc.text(`Description: ${item.description}`);
    doc.text(`Booked Time: ${item.created_at}`);
    doc.end();
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).send("Error generating receipt");
  }
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.yellow);
});
