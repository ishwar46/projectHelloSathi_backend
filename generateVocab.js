const natural = require('natural');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
const vocabPath = path.join(__dirname, 'vocab.json');

console.log('Reading data from:', dataPath);
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const allWords = [];
const tokenizer = new natural.WordTokenizer();

// Tokenize patterns and collect words
data.intents.forEach(intent => {
  intent.patterns.forEach(pattern => {
    const words = tokenizer.tokenize(pattern.toLowerCase());
    allWords.push(...words);
  });
});

// Remove duplicate words
const uniqueWords = [...new Set(allWords)];

console.log('Unique words:', uniqueWords.length); // Debugging line

// Save unique words to vocab.json
try {
  fs.writeFileSync(vocabPath, JSON.stringify(uniqueWords, null, 2));
  console.log('Vocabulary saved to vocab.json');
} catch (error) {
  console.error('Error saving vocab.json:', error);
}
