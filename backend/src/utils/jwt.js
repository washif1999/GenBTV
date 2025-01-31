const jwt = require("jsonwebtoken");

// Generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "21d", // Default to 21 days
  });
};

module.exports = { generateToken };
