const transporter = require("../utils/emailTransporter");
const ejs = require("ejs");
const path = require("path");
const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

exports.sendEmail = async (req, res) => {
  const { name, email } = req.body;

  const templatepath = path.join(process.cwd(), "views", "emailTemplate.ejs");

  const messageTemplate = await ejs.renderFile(templatepath, {
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
