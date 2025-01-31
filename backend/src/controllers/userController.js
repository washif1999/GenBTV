const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Joi = require("joi");
const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Validation schema using Joi
const validateSignup = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    contentType: Joi.array().items(Joi.string()),
    age: Joi.number().min(1),
    gender: Joi.string(),
    topics: Joi.array().items(Joi.string()),
    language: Joi.array().items(Joi.string()),
    viewingTimes: Joi.string(),
    dateOfBirth: Joi.date(),
    genre: Joi.array().items(Joi.string()),
    viewingLength: Joi.string(),
  });

  return schema.validate(data);
};

const signupUser = async (req, res) => {
  const { error } = validateSignup(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const {
    name,
    email,
    password,
    contentType,
    age,
    gender,
    topics,
    language,
    viewingTimes,
    dateOfBirth,
    genre,
    viewingLength,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999); // OTP valid for 10 minutes
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      contentType,
      age,
      gender,
      topics,
      language,
      viewingTimes,
      dateOfBirth,
      genre,
      viewingLength,
      isVerified: false, // User is not verified initially
      otp,
      otpExpires,
    });

    const savedUser = await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: `Generation Black TV <${process.env.EMAIL_USER}>`,
      to: savedUser.email,
      subject: "Verify Your Account",
      text: `Your OTP for account verification is: ${otp}`,
      html: `<p>Your OTP for account verification is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(message);

    res.status(201).json({
      message:
        "User registered successfully. Please verify your account using the OTP sent to your email.",
    });
  } catch (error) {
    console.log(error, "Error");
    res
      .status(500)
      .json({ message: "An error occurred while creating the user." });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if OTP has expired
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Validate the OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate a JWT token
    const token = generateToken(user?._id);

    res.status(200).json({
      message: "Account verified successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};


module.exports = { signupUser, verifyOtp };
