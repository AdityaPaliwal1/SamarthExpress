const Parcel = require("../models/Parcel");
const puppeteer = require("puppeteer");
const receiptTemplate = require("../views/receiptTemplate");

// Create Parcel
exports.createParcel = async (req, res) => {
  try {
    const trackingId = `SE-${Date.now()}`;
    const parcel = new Parcel({ ...req.body, tracking_id: trackingId });
    await parcel.save();
    res.json(parcel);
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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${parcel.sender_name}.pdf"`
    );
    res.end(pdfBuffer);

    await browser.close();
  } catch (err) {
    res.status(500).send("Error generating receipt");
  }
};
