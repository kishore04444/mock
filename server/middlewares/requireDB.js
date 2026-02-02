/**
 * Return 503 with clear message if MongoDB is not connected.
 * Prevents long buffering timeouts on auth/DB routes.
 */
import mongoose from 'mongoose';

export function requireDB(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return res.status(503).json({
    message: 'Database not available. Start MongoDB (e.g. run "mongod") or set MONGODB_URI in server/.env to a valid MongoDB connection string.',
  });
}
