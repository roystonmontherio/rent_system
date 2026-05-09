const AuthService = require('../services/AuthService');

const AuthController = {
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Email already in use' || error.message.startsWith('Invalid role')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }
};

module.exports = AuthController;
