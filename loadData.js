const natural = require('natural');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
const vocabPath = path.join(__dirname, 'vocab.json');

// Read data and prepare vocabulary
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const allWords = [];
const classes = [];
const tokenizer = new natural.WordTokenizer();

data.intents.forEach(intent => {
  intent.patterns.forEach(pattern => {
    const words = tokenizer.tokenize(pattern.toLowerCase());
    allWords.push(...words);
  });
  classes.push(intent.tag);
});

// Remove duplicate words
const uniqueWords = [...new Set(allWords)];

// Ensure the vocabulary size matches the expected input size (67)
while (uniqueWords.length < 67) {
  uniqueWords.push('');
}

const createBagOfWords = (message) => {
  console.log('Exporting createBagOfWords:', createBagOfWords);

  const bag = Array(uniqueWords.length).fill(0);
  const words = tokenizer.tokenize(message.toLowerCase());
  words.forEach(word => {
    const index = uniqueWords.indexOf(word);
    if (index !== -1) {
      bag[index] = 1;
    }
  });
  return bag;
};

module.exports = { createBagOfWords, classes, uniqueWords };
