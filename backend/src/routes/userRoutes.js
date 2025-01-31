const express = require("express");
const { signupUser, verifyOtp } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signupUser);
router.post("/verify-otp", verifyOtp);

module.exports = router;
