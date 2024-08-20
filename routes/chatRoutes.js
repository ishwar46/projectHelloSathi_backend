// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const Chat = require('../models/chatModel')

router.post('/', chat);


router.get('/history/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const chatHistory = await Chat.find({ userId }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order
      res.status(200).json(chatHistory);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });

module.exports = router;
