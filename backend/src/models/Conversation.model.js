const pool = require('../config/db');

const ConversationModel = {
  async createConversation(stayId, initiatorId, recipientId) {
    // Check if exists
    const checkQuery = `
      SELECT * FROM conversations 
      WHERE stay_id = $1 AND initiator_id = $2 AND recipient_id = $3
    `;
    const { rows: existing } = await pool.query(checkQuery, [stayId, initiatorId, recipientId]);
    
    if (existing.length > 0) {
      const conv = existing[0];
      // If archived or declined, reactivate it to pending
      if (conv.status === 'archived' || conv.status === 'declined') {
        const updateQuery = `
          UPDATE conversations 
          SET status = 'pending', last_message_at = NOW() 
          WHERE id = $1 
          RETURNING *;
        `;
        const { rows: updated } = await pool.query(updateQuery, [conv.id]);
        return updated[0];
      }
      return conv;
    }

    const insertQuery = `
      INSERT INTO conversations (stay_id, initiator_id, recipient_id, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [stayId, initiatorId, recipientId]);
    return rows[0];
  },

  async findByStayAndUsers(stayId, initiatorId, recipientId) {
    const query = `
      SELECT * FROM conversations 
      WHERE stay_id = $1 AND initiator_id = $2 AND recipient_id = $3
    `;
    const { rows } = await pool.query(query, [stayId, initiatorId, recipientId]);
    return rows[0];
  },

  async findByUserId(userId) {
    const query = `
      SELECT c.*, 
             s.title as property_title,
             u1.first_name as guest_first_name, u1.last_name as guest_last_name,
             u2.first_name as host_first_name, u2.last_name as host_last_name,
             m.message_text as latest_message,
             m.created_at as latest_message_at,
             (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = FALSE) as unread_count
      FROM conversations c
      LEFT JOIN stays s ON s.id = c.stay_id
      JOIN users u1 ON u1.id = c.initiator_id
      JOIN users u2 ON u2.id = c.recipient_id
      LEFT JOIN LATERAL (
        SELECT message_text, created_at 
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) m ON true
      WHERE (c.initiator_id = $1 OR c.recipient_id = $1)
        AND c.status NOT IN ('archived', 'declined')
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  async findById(id) {
    const query = `SELECT * FROM conversations WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async updateStatus(id, status) {
    const query = `UPDATE conversations SET status = $1 WHERE id = $2 RETURNING *`;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
  },

  async updateLastMessageAt(id) {
    const query = `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`;
    await pool.query(query, [id]);
  },

  async archive(id) {
    return await this.updateStatus(id, 'archived');
  }
};

module.exports = ConversationModel;
