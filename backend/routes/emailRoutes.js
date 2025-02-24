const express = require("express");
const { sendEmail, toEnterprise, approveAdmin, checkApproval } = require("../controllers/emailController");

const router = express.Router();

router.post("/", sendEmail);
router.post("/toEnterprise", toEnterprise);
router.post("/approve-admin" , approveAdmin);
router.get("/check-approval",checkApproval)

module.exports = router;
