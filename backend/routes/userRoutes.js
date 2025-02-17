const express = require("express");
const UserController = require("../controllers/UserController");

const router = express.Router();

// Register route
router.post("/register", UserController.register);

// Login route
router.post("/login", UserController.login);

// Get user role route (only accessible by admins)


module.exports = router;
