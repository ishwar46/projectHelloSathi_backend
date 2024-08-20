const axios = require('axios');
require('dotenv').config();

// In-memory store for image status
let imageStatus = {
  imageUrl: null,
};

// Function to generate an image using OpenAI API
const generateImage = async (description) => {
  try {
    const params = {
      prompt: description,
      n: 1,
      size: '1024x1024',
    };

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData = response.data.data[0].url;
    if (responseData) {
      imageStatus.imageUrl = responseData;
      return imageStatus.imageUrl;
    } else {
      console.error('No image data returned from OpenAI API.');
      throw new Error('There was an error generating the image.');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error; // Re-throw error to be handled by route handler
  }
};

// Function to check image status
const checkImageStatus = (req, res) => {
  res.json(imageStatus);
};

// Route handlers
const handleGenerateImage = async (req, res) => {
  const { description } = req.body;

  try {
    const imageUrl = await generateImage(description);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
};

module.exports = {
  handleGenerateImage,
  checkImageStatus,
};