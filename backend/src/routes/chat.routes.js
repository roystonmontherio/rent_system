const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// POST /api/chat/conversations
router.post('/conversations', ChatController.startConversation);

// GET /api/chat/conversations
router.get('/conversations', ChatController.getUserConversations);

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', ChatController.getMessages);

// POST /api/chat/conversations/:id/messages
router.post('/conversations/:id/messages', ChatController.sendMessage);

// PUT /api/chat/conversations/:id/archive
router.put('/conversations/:id/archive', ChatController.archiveConversation);

// PUT /api/chat/conversations/:id/accept
router.put('/conversations/:id/accept', ChatController.acceptConversation);

// PUT /api/chat/conversations/:id/decline
router.put('/conversations/:id/decline', ChatController.declineConversation);

// PUT /api/chat/conversations/:id/read
router.put('/conversations/:id/read', ChatController.markMessagesRead);

module.exports = router;
