const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');
const { createBagOfWords, classes } = require('./loadData');

// Load vocabulary
const vocab = JSON.parse(fs.readFileSync(path.join(__dirname, 'vocab.json'), 'utf8'));
const vocabSize = vocab.length;

const trainModel = async () => {
  // Load data
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const documents = [];
  
  data.intents.forEach(intent => {
    intent.patterns.forEach(pattern => {
      const words = pattern.toLowerCase().split(/\s+/);
      documents.push({ words, tag: intent.tag });
    });
  });

  const trainingData = documents.map(doc => {
    const bag = createBagOfWords(doc.words.join(' '));
    const outputRow = Array(classes.length).fill(0);
    outputRow[classes.indexOf(doc.tag)] = 1;
    return { input: bag, output: outputRow };
  });

  const inputData = trainingData.map(d => d.input);
  const outputData = trainingData.map(d => d.output);

  const xs = tf.tensor2d(inputData);
  const ys = tf.tensor2d(outputData);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [vocabSize] }));
  model.add(tf.layers.dropout({ rate: 0.5 }));
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.5 }));
  model.add(tf.layers.dense({ units: classes.length, activation: 'softmax' }));

  model.compile({
    optimizer: tf.train.sgd(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  await model.fit(xs, ys, { epochs: 200, batchSize: 5, validationSplit: 0.2 });
  
  await model.save(`file://${path.join(__dirname, "model")}`);
  console.log("Model trained and saved!");

  // Save the vocabulary size
  fs.writeFileSync(
    path.join(__dirname, 'vocab_size.json'),
    JSON.stringify({ size: vocabSize }, null, 2)
  );
  console.log("Vocabulary size saved!");
};

trainModel();
