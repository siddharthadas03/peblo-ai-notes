const mongoose = require('mongoose');
const { getMongoUri } = require('./env');

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(getMongoUri());
  console.log('MongoDB connected');
};

module.exports = connectDB;
