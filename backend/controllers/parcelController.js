const Parcel = require("../models/Parcel");
const puppeteer = require("puppeteer");
const receiptTemplate = require("../views/receiptTemplate");
const { jsPDF } = require("jspdf");
const Razorpay = require("razorpay");
require("dotenv").config();
const razorpay = require("../utils/razorpay");
// Create Parcel
exports.createParcel = async (req, res) => {
  try {
    const { razorpay_payment_id, trackingDetails } = req.body;
    if (!razorpay_payment_id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }
    const trackingId = `SE-${Date.now()}`;
    const parcel = new Parcel({
      ...trackingDetails,
      tracking_id: trackingId,
      razorpay_payment_id,
    });
    await parcel.save();
    res.json({
      message: "Parcel created successfully",
      parcel,
    });
  } catch (err) {
    res.status(500).send("Error creating parcel");
  }
};

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
exports.generateReceipt = async (req, res) => {
  const { trackingId } = req.params;

  try {
    const parcel = await Parcel.findOne({ tracking_id: trackingId });
    if (!parcel) return res.status(404).send("Parcel not found");

    const receiptHtml = receiptTemplate(parcel);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(receiptHtml);

    const pdfBuffer = await page.pdf();

    await browser.close();

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${parcel.tracking_id}.pdf"`
    );
    res.end(pdfBuffer);
  } catch (err) {
    console.error("Error generating receipt:", err);
    res.status(500).send("Error generating receipt");
  }
};
