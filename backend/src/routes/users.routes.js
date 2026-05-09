const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

/**
 * GET /api/users/brokers
 * Returns all registered brokers with their profile info.
 * Protected — only owners need this.
 */
router.get(
  '/brokers',
  authMiddleware,
  authorizeRoles('owner'),
  async (req, res, next) => {
    try {
      const query = `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          bp.agency_name,
          bp.is_verified,
          bp.rating
        FROM users u
        JOIN broker_profiles bp ON bp.user_id = u.id
        WHERE u.role = 'broker' AND u.deleted_at IS NULL
        ORDER BY u.first_name ASC;
      `;
      const { rows } = await pool.query(query);
      res.status(200).json({ success: true, brokers: rows });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
