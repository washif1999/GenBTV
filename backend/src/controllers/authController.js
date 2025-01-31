const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Login Controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during login." });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    }

    // Generate an OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes
    await user.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: "Generation Black TV <ashwindatasense@gmail.com>",
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for the next 15 minutes.`,
      html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It is valid for the next 15 minutes.</p>`,
    };

    await transporter.sendMail(message);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.log(error, "Error");
    res
      .status(500)
      .json({
        message: "An error occurred during the password reset process.",
      });
  }
};

const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure OTP is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred during OTP verification." });
  }
};
// Reset Password Controller
const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password, "email, password");
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    }

    // Hash the new password and save
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.log(error, "Error");
    res
      .status(500)
      .json({ message: "An error occurred during password reset." });
  }
};

const checkToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token is valid
    res.status(200).json({
      message: "Token is valid.",
      expiresAt: decoded.exp * 1000, // Convert to milliseconds
      isExpired: false,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Token is expired
      return res.status(401).json({
        message: "Token has expired.",
        isExpired: true,
      });
    }

    // Other errors
    res.status(401).json({
      message: "Invalid token.",
      isExpired: true,
    });
  }
};

module.exports = { loginUser, forgotPassword, resetPassword, checkToken, verifyResetOtp };


