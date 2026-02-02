/**
 * JWT authentication middleware - protects routes (uses in-memory store)
 */
import jwt from 'jsonwebtoken';
import * as store from '../store/memoryStore.js';

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized. No token.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await store.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};
