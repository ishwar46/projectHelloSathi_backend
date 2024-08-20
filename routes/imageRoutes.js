// routes/imageRoutes.js

const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Route to generate image
router.post('/generate-image', imageController.handleGenerateImage);

// Route to check image status
router.get('/check-image-status', imageController.checkImageStatus);

module.exports = router;
