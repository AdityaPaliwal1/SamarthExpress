const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
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
app.use("/api/receipt", parcelRoutes);
app.use("/api/send-email", emailRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.yellow));
