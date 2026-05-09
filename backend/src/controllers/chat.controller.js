const ChatService = require('../services/ChatService');

const ChatController = {
  async startConversation(req, res, next) {
    try {
      const { stay_id } = req.body;
      const conversation = await ChatService.startOrGetConversation(stay_id, req.user.id);
      res.status(200).json({ success: true, conversation });
    } catch (error) {
      next(error);
    }
  },

  async getUserConversations(req, res, next) {
    try {
      const conversations = await ChatService.getUserConversations(req.user.id);
      res.status(200).json({ success: true, conversations });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req, res, next) {
    try {
      const { id } = req.params;
      const messages = await ChatService.getMessages(id, req.user.id);
      res.status(200).json({ success: true, messages });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { message_text } = req.body;
      const message = await ChatService.sendMessage(id, req.user.id, message_text);
      res.status(201).json({ success: true, message });
    } catch (error) {
      next(error);
    }
  },

  async archiveConversation(req, res, next) {
    try {
      const { id } = req.params;
      await ChatService.updateConversationStatus(id, req.user.id, 'archived');
      res.status(200).json({ success: true, message: 'Conversation archived' });
    } catch (error) {
      next(error);
    }
  },

  async acceptConversation(req, res, next) {
    try {
      const { id } = req.params;
      await ChatService.updateConversationStatus(id, req.user.id, 'accepted');
      res.status(200).json({ success: true, message: 'Conversation accepted' });
    } catch (error) {
      next(error);
    }
  },

  async declineConversation(req, res, next) {
    try {
      const { id } = req.params;
      await ChatService.updateConversationStatus(id, req.user.id, 'declined');
      res.status(200).json({ success: true, message: 'Conversation declined' });
    } catch (error) {
      next(error);
    }
  },

  async markMessagesRead(req, res, next) {
    try {
      const { id } = req.params;
      await ChatService.markMessagesRead(id, req.user.id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ChatController;
