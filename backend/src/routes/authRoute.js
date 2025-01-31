const express = require("express");
const {
  loginUser,
  forgotPassword,
  resetPassword,
  checkToken,
  verifyResetOtp
} = require("../controllers/authController");
const router = express.Router();

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check-token", checkToken);
router.post("/verify-reset-otp", verifyResetOtp);


module.exports = router;
