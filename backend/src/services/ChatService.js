const ConversationModel = require('../models/Conversation.model');
const MessageModel = require('../models/Message.model');
const StayModel = require('../models/Stay.model');
const { emitToRoom } = require('../config/socket');

const ChatService = {
  async startOrGetConversation(stayId, initiatorId) {
    const stay = await StayModel.findById(stayId);
    if (!stay) throw new Error('Property not found');
    
    // listed_by_id is the recipient (host/broker)
    if (stay.listed_by_id === initiatorId) {
      throw new Error('You cannot start a conversation with yourself.');
    }

    const conv = await ConversationModel.createConversation(stayId, initiatorId, stay.listed_by_id);
    return conv;
  },

  async getUserConversations(userId) {
    return await ConversationModel.findByUserId(userId);
  },

  async getMessages(conversationId, userId) {
    const conv = await ConversationModel.findById(conversationId);
    if (!conv) throw new Error('Conversation not found');
    if (conv.initiator_id !== userId && conv.recipient_id !== userId) {
      throw new Error('Unauthorized');
    }

    return await MessageModel.findByConversationId(conversationId);
  },

  async sendMessage(conversationId, senderId, message_text) {
    const conv = await ConversationModel.findById(conversationId);
    if (!conv) throw new Error('Conversation not found');
    if (conv.initiator_id !== senderId && conv.recipient_id !== senderId) {
      throw new Error('Unauthorized');
    }

    if (conv.status === 'pending' && conv.initiator_id === senderId) {
      throw new Error('Please wait for the recipient to accept your chat request.');
    }

    if (conv.status === 'declined' || conv.status === 'archived') {
      throw new Error('This conversation is no longer active.');
    }

    const message = await MessageModel.createMessage(conversationId, senderId, message_text);
    await ConversationModel.updateLastMessageAt(conversationId);

    // Real-time Emit: To the conversation room
    emitToRoom(`conv_${conversationId}`, 'new_message', message);

    // Real-time Emit: To the recipient's private room to update their sidebar
    const recipientId = conv.initiator_id === senderId ? conv.recipient_id : conv.initiator_id;
    emitToRoom(`user_${recipientId}`, 'inbox_update', {
      conversation_id: conversationId,
      latest_message: message_text,
      latest_message_at: new Date()
    });

    return message;
  },

  async updateConversationStatus(conversationId, userId, status) {
    const conv = await ConversationModel.findById(conversationId);
    if (!conv) throw new Error('Conversation not found');
    
    // Only recipient can accept/decline
    if (status === 'accepted' || status === 'declined') {
      if (conv.recipient_id !== userId) throw new Error('Only the recipient can respond to a chat request.');
    } else {
      // Both can archive
      if (conv.initiator_id !== userId && conv.recipient_id !== userId) throw new Error('Unauthorized');
    }

    const updated = await ConversationModel.updateStatus(conversationId, status);

    // Real-time Emit: Notify both parties about status change
    emitToRoom(`user_${conv.initiator_id}`, 'status_updated', { conversation_id: conversationId, status });
    emitToRoom(`user_${conv.recipient_id}`, 'status_updated', { conversation_id: conversationId, status });

    return updated;
  },

  async archiveConversation(conversationId, userId) {
    return await this.updateConversationStatus(conversationId, userId, 'archived');
  },

  async markMessagesRead(conversationId, userId) {
    return await MessageModel.markReadByConversation(conversationId, userId);
  }
};

module.exports = ChatService;
