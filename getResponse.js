const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');
const { createBagOfWords, classes } = require('./loadData');

let model;

const loadModel = async () => {
  try {
    const modelPath = path.join(__dirname, 'model', 'model.json');
    model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('Model loaded!');
  } catch (error) {
    console.error('Error loading model:', error);
  }
};

const getResponse = async (message) => {
  try {
    if (!model) {
      await loadModel();
    }

    // Check if createBagOfWords is a function
    if (typeof createBagOfWords !== 'function') {
      throw new Error('createBagOfWords is not a function');
    }

    console.log('Imported createBagOfWords:', createBagOfWords);

    const bag = createBagOfWords(message);
    console.log('Bag of Words Length:', bag.length);
    console.log('Bag of Words:', bag);

    const input = tf.tensor2d([bag]);
    const predictions = model.predict(input).arraySync();
    console.log('Predictions:', JSON.stringify(predictions));

    const predictedIndex = predictions[0].indexOf(Math.max(...predictions[0]));
    const tag = classes[predictedIndex];
    console.log('Predicted Tag:', tag);

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
    console.log('Intents Data:', JSON.stringify(data.intents));

    const intent = data.intents.find(intent => intent.tag === tag);
    console.log('Matched Intent:', intent);

    return intent ? intent.responses[Math.floor(Math.random() * intent.responses.length)] : 'Sorry, I did not understand that.';
  } catch (error) {
    console.error('Error in getResponse:', error);
    return 'Sorry, there was an error processing your request.';
  }
};

module.exports = { getResponse, loadModel };
