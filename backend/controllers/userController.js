const express = require("express");
const bcrypt = require("bcryptjs"); // For hashing passwords
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).send("Please provide all required fields.");
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with this email.");
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the user to the database
    await newUser.save();

    // Return the new user object (without password)
    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (e) {
    console.error("Error Registering:", e);
    res.status(500).send("Error registering user.");
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

    // Generate a JWT token for the user
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Use a secure secret key
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Send the response with the user info and JWT token
    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("Error Logging in:", e);
    res.status(500).send("Error logging in.");
  }
};
