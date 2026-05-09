const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const OtpController = require('../controllers/otp.controller');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// OTP Routes
router.post('/send-otp', OtpController.sendOtp);
router.post('/verify-otp', OtpController.verifyOtp);

module.exports = router; 
