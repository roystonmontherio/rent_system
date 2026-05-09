const OtpService = require('../services/OtpService');

const OtpController = {
  async sendOtp(req, res, next) {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required.' });
      }

      // Generate OTP
      const otp = OtpService.generateOtp(phone);
      
      // Send OTP via SMS
      await OtpService.sendOtpSms(phone, otp);

      res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required.' });
      }

      const result = OtpService.verifyOtp(phone, otp);
      
      if (!result.valid) {
        return res.status(400).json({ error: result.message });
      }

      res.status(200).json({ message: 'Phone number verified successfully.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = OtpController;
