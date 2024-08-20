// controllers/uploadController.js
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const vision = require('@google-cloud/vision');
const axios = require('axios');

// Google Cloud Vision client
const client = new vision.ImageAnnotatorClient({
    keyFilename: '/Users/nirajansubedi/Downloads/pc-api-5087439032110048837-201-2a1ea36d4c25.json'
});


// Function to summarize text using OpenAI
const summarizeText = async (text) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content: 'You are a helpful assistant.'
            }, {
                role: 'user',
                content: `Summarize the following text:\n\n${text}`
            }],
            max_tokens: 100,
            temperature: 0.5,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('AI response:', response.data);
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error summarizing text:', error.response ? error.response.data : error.message);
        return 'Error generating summary';
    }
};


const uploadFile = async (req, res) => {
    const file = req.file;

    if (!file) {
        console.log('No file uploaded');
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '../uploads/', file.filename);
    let summary = 'File received and processed.';

    try {
        if (file.mimetype.startsWith('image/')) {
            const [result] = await client.labelDetection(file.path);
            const labels = result.labelAnnotations.map(label => label.description).join(', ');

            summary = labels ? `This image contains: ${labels}` : "No labels detected.";
            fs.unlinkSync(file.path);
            return res.json({ success: true, fileUrl: `/uploads/${file.filename}`, summary });
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            if (!result.value || result.value.trim().length === 0) {
                summary = 'No summary available';
            } else {
                summary = await summarizeText(result.value);
            }
            fs.unlinkSync(filePath);
            return res.json({ success: true, fileUrl: `/uploads/${file.filename}`, summary });
        } else if (file.mimetype === 'application/pdf') {
            // TODO: Add PDF processing logic here
            fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: 'PDF processing not implemented' });
        } else {
            fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: 'Unsupported file type' });
        }
    } catch (err) {
        console.error('Error processing file:', err);
        fs.unlinkSync(filePath);
        return res.status(500).json({ success: false, message: 'Error processing file' });
    }
};

module.exports = { uploadFile };
