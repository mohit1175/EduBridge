const mongoose = require('mongoose');

async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI in environment');
  }
  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  console.log('Connected to MongoDB');
}

module.exports = connectDb;