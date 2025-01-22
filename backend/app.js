const express = require("express");
const { config } = require("dotenv");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const color = require("colors");
const nodeMailer = require("nodemailer");
const app = express();
app.use(cors());
app.use(bodyParser.json());

config();
app.use(express.json());
dotenv.config();
// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/samarth-express", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB".green))
  .catch((err) => console.error(err));

// Parcel Schema
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

const Parcel = mongoose.model("Parcel", parcelSchema);

// Routes
app.post("/api/parcels", async (req, res) => {
  try {
    const trackingId = `SE-${Date.now()}`;
    const parcel = new Parcel({ ...req.body, tracking_id: trackingId });
    await parcel.save();
    res.json(parcel);
  } catch (err) {
    res.status(500).send("Error creating parcel");
  }
});

app.get("/api/parcels/:trackingId", async (req, res) => {
  try {
    const parcel = await Parcel.findOne({ tracking_id: req.params.trackingId });
    if (!parcel) return res.status(404).send("Parcel not found");
    res.json(parcel);
  } catch (err) {
    res.status(500).send("Error fetching parcel");
  }
});

// Send email
const transporter = nodeMailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// console.log(process.env.EMAIL);
// console.log(process.env.PASSWORD);

app.post("/api/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Hello from Samarth Express, ${name}`,
    html: "<b>Parcel Details</b>",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Email sent successfully" }); // Return success as JSON
    }
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.yellow));
