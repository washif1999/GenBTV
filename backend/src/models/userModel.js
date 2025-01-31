const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contentType: [{ type: String }],
    age: { type: Number },
    gender: { type: String },
    topics: [{ type: String }],
    language: [{ type: String }],
    viewingTimes: { type: String },
    dateOfBirth: { type: Date },
    genre: [{ type: String }],
    viewingLength: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordOTP: {
      type: Number,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
