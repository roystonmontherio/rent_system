const pool = require('../config/db');

const MessageModel = {
  async createMessage(conversationId, senderId, message_text) {
    const query = `
      INSERT INTO messages (conversation_id, sender_id, message_text)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [conversationId, senderId, message_text]);
    return rows[0];
  },

  async findByConversationId(conversationId) {
    const query = `
      SELECT m.*, u.first_name, u.last_name
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC;
    `;
    const { rows } = await pool.query(query, [conversationId]);
    return rows;
  },

  async markReadByConversation(conversationId, userId) {
    const query = `
      UPDATE messages 
      SET is_read = TRUE 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE
    `;
    await pool.query(query, [conversationId, userId]);
  }
};

module.exports = MessageModel;
