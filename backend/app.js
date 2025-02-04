const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const getStream = require("get-stream");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const Parcel = require("./models/Parcel");
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
    origin: "https://samarthexpress.onrender.com", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

dotenv.config();

const _dirname = path.resolve();
// Middleware
const CorsOptions = {
  origin: "https://samarthexpress.onrender.com",
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
    const allParcels = await Parcel.find();
    res.status(200).json(allParcels);
  } catch (err) {
    console.error("Error fetching all parcels:", err);
    res.status(500).send("Error fetching all parcels");
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
    const parcel = await Parcel.findOne({ tracking_id: trackingId });

    if (!parcel) {
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
    doc.fontSize(12).text(`Tracking ID: ${parcel.tracking_id}`);
    doc.fontSize(12).text(`Payment ID: ${parcel.payment_id}`);
    doc.fontSize(12).text(`Order ID: ${parcel.order_id}`);
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
    doc.end();
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).send("Error generating receipt");
  }
});
// Socket.io
// const updateDeliveryStatusAutomatically = async () => {
//   try {
//     const parcels = await Parcel.find({ delivered: false });

//     const now = new Date();
//     for (const parcel of parcels) {
//       const createdAt = new Date(parcel.created_at);
//       const elapsedHours = Math.floor(
//         (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
//       );

//       if (elapsedHours >= 24) {
//         parcel.delivered = true;
//         await parcel.save();
//         io.emit("deliveryStatusUpdated", parcel); // Notify all clients
//         console.log(`Parcel ${parcel.tracking_id} marked as delivered.`);
//       }
//     }
//   } catch (err) {
//     console.error("Error updating delivery status:", err);
//   }
// };

// Schedule the task to run every hour
setInterval(updateDeliveryStatusAutomatically, 60 * 60 * 1000);

// Start Server
const PORT = process.env.PORT;

app.use(express.static(path.join(_dirname, "/project/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(_dirname, "project", "dist", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.yellow);
});
