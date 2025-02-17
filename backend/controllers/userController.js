const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

exports.register = async (req, res) => {
  const { email, password, name, role = "Customer" } = req.body;

  if (!email || !password || !name) {
    return res.status(400).send("Please provide all required fields.");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with this email.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      unique_id: Math.random().toString(36).substr(2, 9),
    });

    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      unique_id: newUser.unique_id || "Not stored", // Include in response
    });
  } catch (err) {
    console.error("Error Registering:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please provide both email and password.");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found with this email address.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Incorrect password.");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userRole: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role : user.role
      },
    });
  } catch (e) {
    console.error("Error Logging in:", e);
    res.status(500).send("Error logging in.");
  }
};
