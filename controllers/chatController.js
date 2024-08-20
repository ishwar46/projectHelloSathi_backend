const { getResponse } = require('../getResponse');

const chat = async (req, res) => {
  try {
    const message = req.body.message;
    const response = await getResponse(message);
    res.json({ response });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { chat };