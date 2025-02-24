const transporter = require("../utils/emailTransporter");
const ejs = require("ejs");
const path = require("path");
const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

exports.sendEmail = async (req, res) => {
  const { name, email } = req.body;

  const templatePath = path.join(__dirname, "..", "views", "emailTemplate.ejs");

  const messageTemplate = await ejs.renderFile(templatePath, {
    name,
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Hello from Samarth Express, ${name}`,
    html: messageTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
};

exports.toEnterprise = async (req, res) => {
  const { name, email } = req.body;

  const templatePath = path.join(
    __dirname,
    "..",
    "views",
    "toenterpriseTemplate.ejs"
  );
  const messageTemplate = await ejs.renderFile(templatePath, {
    name,
    email,
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL,
    subject: "Grant Request for Admin accesss",
    html: messageTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent from  :" + email);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
};

const approvedUsers = {}; // Replace with a database in production

exports.approveAdmin = (req, res) => {
  console.log("Received Approve Request:", req.body);

  const email = req.body.email || req.query.email;

  if (!email) {
    console.log("No email provided in request");
    return res.status(400).json({ message: "Email is required" });
  }

  if (approvedUsers[email]) {
    console.log("User already approved");
    return res.status(400).json({ message: "User already approved" });
  }

  approvedUsers[email] = true;
  console.log("User approved successfully:", email);
  res.status(200).json({ message: "User approved successfully" });
};

exports.checkApproval = (req, res) => {
  const { email } = req.query;
  res.json({ approved: !!approvedUsers[email] });
};
