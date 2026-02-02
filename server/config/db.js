/**
 * MongoDB connection using Mongoose
 * Keeps server running if MongoDB is down; retries in background.
 */
import mongoose from 'mongoose';

const connectDB = async () => {
  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.warn('MongoDB not available:', error.message, '- Server running. Start MongoDB for full features.');
      return false;
    }
  };
  const connected = await tryConnect();
  if (!connected) {
    setInterval(tryConnect, 10000);
  }
};

export default connectDB;
