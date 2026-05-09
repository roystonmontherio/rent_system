const pool = require('../config/db');

const ChatModel = {
  // Check if an active conversation already exists between the two users
  async findActiveConversation(initiatorId, recipientId, stayId) {
    const query = `
      SELECT * FROM conversations 
      WHERE is_active = TRUE 
        AND ((initiator_id = $1 AND recipient_id = $2) OR (initiator_id = $2 AND recipient_id = $1))
        AND ($3::int IS NULL OR stay_id = $3)
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [initiatorId, recipientId, stayId || null]);
    return rows[0];
  },

  // Create a new conversation row
  async createConversation(data) {
    const { initiator_id, recipient_id, stay_id } = data;
    const query = `
      INSERT INTO conversations (initiator_id, recipient_id, stay_id, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [initiator_id, recipient_id, stay_id || null]);
    return rows[0];
  },

  // Retrieve a conversation by ID for security checks
  async getConversationById(conversationId) {
    const query = `SELECT * FROM conversations WHERE id = $1`;
    const { rows } = await pool.query(query, [conversationId]);
    return rows[0];
  },

  // Insert a new message into a conversation
  async createMessage(conversationId, senderId, messageText) {
    const query = `
      INSERT INTO messages (conversation_id, sender_id, message_text)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [conversationId, senderId, messageText]);
    return rows[0];
  },

  // Fetch all active conversations and laterally join the latest message using the sorting index
  async fetchInbox(userId) {
    const query = `
      SELECT c.id as conversation_id, c.initiator_id, c.recipient_id, c.stay_id,
             m.id as last_message_id, m.message_text as latest_message, m.created_at as last_message_time,
             m.sender_id as last_sender_id, m.is_read
      FROM conversations c
      LEFT JOIN LATERAL (
        SELECT id, message_text, created_at, sender_id, is_read
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE (c.initiator_id = $1 OR c.recipient_id = $1)
        AND c.is_active = TRUE
      ORDER BY m.created_at DESC NULLS LAST;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  // Fetch all messages for a specific conversation
  async fetchMessages(conversationId) {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC;
    `;
    const { rows } = await pool.query(query, [conversationId]);
    return rows;
  }
};

module.exports = ChatModel;
