const axios = require('axios');
const crypto = require('crypto');

// In-memory store for OTPs. 
// For production, consider using Redis.
// Format: { "+1234567890": { otp: "123456", expiresAt: 1715000000000 } }
const otpStore = new Map();

const OtpService = {
  /**
   * Generates a 6-digit OTP and stores it.
   */
  generateOtp(phone) {
    // Generate a 6 digit random number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 5 minutes from now
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // Store it
    otpStore.set(phone, { otp, expiresAt });
    
    return otp;
  },

  /**
   * Verifies the OTP.
   */
  verifyOtp(phone, otp) {
    const record = otpStore.get(phone);
    
    if (!record) {
      return { valid: false, message: 'No OTP found for this number.' };
    }
    
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return { valid: false, message: 'OTP has expired.' };
    }
    
    if (record.otp !== otp) {
      return { valid: false, message: 'Invalid OTP.' };
    }
    
    // Mark as verified for 15 minutes to allow registration
    otpStore.set(phone, { verified: true, expiresAt: Date.now() + 15 * 60 * 1000 });
    
    return { valid: true, message: 'OTP verified successfully.' };
  },

  /**
   * Checks if a phone number was verified recently.
   */
  isPhoneVerified(phone) {
    const record = otpStore.get(phone);
    if (record && record.verified && Date.now() <= record.expiresAt) {
      // Consume the verification so it can't be reused
      otpStore.delete(phone);
      return true;
    }
    return false;
  },

  /**
   * Sends the OTP via Fast2SMS API.
   */
  async sendOtpSms(phone, otp) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (!apiKey) {
      console.warn('FAST2SMS_API_KEY is not set in environment variables. Falling back to console log for OTP.');
      console.log(`[MOCK SMS] To: ${phone} | OTP: ${otp}`);
      return { success: true, message: 'Mock OTP sent (check console).' };
    }

    try {
      // Fast2SMS API integration
      // https://docs.fast2sms.com/?javascript#send-sms-get
      
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'q',
          message: `Your RentSystem verification OTP is ${otp}. It is valid for 5 minutes.`,
          language: 'english',
          flash: 0,
          numbers: phone.replace('+', '') // Fast2SMS expects numbers without '+'
        },
        {
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.return === true) {
        return { success: true, message: 'OTP sent successfully.' };
      } else {
        throw new Error(response.data.message || 'Failed to send OTP via Fast2SMS');
      }
    } catch (error) {
      const errorData = error.response?.data;
      console.error('Fast2SMS Error:', errorData || error.message);
      
      // Fast2SMS requires a 100 INR transaction before using the API route.
      // If we hit this restriction, automatically fall back to Mock OTP so development isn't blocked.
      if (errorData?.status_code === 999 && errorData?.message?.includes('100 INR')) {
        console.warn('⚠️ Fast2SMS requires a ₹100 deposit. Falling back to MOCK OTP for now.');
        console.log(`[MOCK SMS FALLBACK] To: ${phone} | OTP: ${otp}`);
        return { success: true, message: 'Mock OTP sent (check backend console).' };
      }

      throw new Error('Failed to send OTP SMS. Please check your Fast2SMS API key or try again.');
    }
  }
};

module.exports = OtpService;
