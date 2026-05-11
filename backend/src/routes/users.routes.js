const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

/**
 * GET /api/users/stats
 * Returns dashboard metrics for the authenticated user (owner or broker).
 */
router.get(
  '/stats',
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // 1. Total Properties Listed by the user
      const propsQuery = `SELECT COUNT(*)::int as total FROM stays WHERE listed_by_id = $1 AND deleted_at IS NULL`;
      
      // 2. Inbox Requests (Pending conversations where user is recipient)
      const inboxQuery = `SELECT COUNT(*)::int as total FROM conversations WHERE recipient_id = $1 AND status = 'pending'`;
      
      // 3. Total Active Conversations
      const convsQuery = `SELECT COUNT(*)::int as total FROM conversations WHERE (initiator_id = $1 OR recipient_id = $1) AND status NOT IN ('archived', 'declined')`;
      
      const [propsResult, inboxResult, convsResult] = await Promise.all([
        pool.query(propsQuery, [userId]),
        pool.query(inboxQuery, [userId]),
        pool.query(convsQuery, [userId])
      ]);

      res.status(200).json({
        success: true,
        stats: {
          totalProperties: propsResult.rows[0].total,
          inboxRequests: inboxResult.rows[0].total,
          activeConversations: convsResult.rows[0].total
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

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
