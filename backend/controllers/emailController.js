const transporter = require("../utils/emailTransporter");

exports.sendEmail = async (req, res) => {
  const { name, email } = req.body;

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
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
};
