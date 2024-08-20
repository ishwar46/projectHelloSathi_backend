const express = require('express');
const cors = require('cors');
const path = require('path');
const readline = require('readline');
const { getResponse, loadModel } = require('./getResponse');
const connectDB = require('./database/database');
const dotenv = require('dotenv');
const Chat = require('./models/chatModel'); 

const app = express();

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// dotenv config
dotenv.config();

connectDB();

// Accepting JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Load model and set up readline interface for chatbot
loadModel().then(() => {
  console.log('Chatbot is running. You can start chatting now.');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const message = line.trim();
    const response = await getResponse(message);
    console.log('Chatbot:', response);
    rl.prompt();
  }).on('close', () => {
    console.log('Chatbot session ended.');
    process.exit(0);
  });
});

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/upload', require('./routes/uploadRoutes'));
app.use('/api/images', require('./routes/imageRoutes'));

app.post('/api/predict', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No input provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID not provided' });
    }

    console.log("Received message:", message);

    // Save the user's message to the database
    const userMessage = new Chat({
      userId: userId,
      email: 'User',
      message: message,
    });
    await userMessage.save();
    console.log("User message saved to database.");

    // Get the response from the model
    const response = await getResponse(message);
    console.log("Bot response generated:", response);

    // Save the bot's response to the database
    const botMessage = new Chat({
      userId: userId,
      email: 'Hello Sathi',
      message: response,
    });
    await botMessage.save();
    console.log("Bot message saved to database.");

    // Send the response back to the client
    res.status(200).json({ response });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'An error occurred during prediction' });
  }
});


const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
