import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';

mongoose.connect(uri);

const db = mongoose.connection;

db.on('connected', () => {
  console.log('MongoDB connected at', uri);
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

export default db;
