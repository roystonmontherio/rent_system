const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const UserModel = require('../models/User.model');
const { generateNextReference } = require('../utils/generateReference');
const OtpService = require('./OtpService');

const AuthService = {
  async register(data) {
    const { email, password, first_name, last_name, phone, role, business_name, agency_name, firebaseToken } = data;

    // Validate role
    const validRoles = ['public_user', 'owner', 'broker'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Verify Phone OTP
    if (phone && !OtpService.isPhoneVerified(phone)) {
      throw new Error('Phone number is not verified or verification expired.');
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Generate account number inside the transaction using the same client
      const account_no = await generateNextReference('USR', client);

      // Create user
      const userData = { account_no, email, password_hash, first_name, last_name, phone, role };
      const newUser = await UserModel.createUser(userData, client);

      // Handle role-specific profiles
      if (role === 'owner') {
        await UserModel.createOwnerProfile(newUser.id, business_name || null, client);
      } else if (role === 'broker') {
        await UserModel.createBrokerProfile(newUser.id, agency_name || null, client);
      }

      await client.query('COMMIT');

      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id, role: newUser.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
      );

      return { user: newUser, token };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async login(data) {
    const { email, password } = data;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
};

module.exports = AuthService;
