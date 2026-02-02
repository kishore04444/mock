/**
 * Auth controller - register, login, get current user (uses in-memory store)
 */
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import * as store from '../store/memoryStore.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

/**
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { name, email, password } = req.body;
    const exists = await store.findUserByEmail(email);
    if (exists) {
      return res.status(400).json({ message: 'This email is already registered. Try signing in or use a different email.' });
    }
    const user = await store.createUser({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed.' });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email. Please sign up first.' });
    }
    if (!(await store.comparePassword(user, password))) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed.' });
  }
}

/**
 * GET /api/auth/me - protected
 */
export async function getMe(req, res) {
  try {
    const user = await store.findUserById(req.user._id);
    if (!user) return res.status(401).json({ message: 'User not found. Please sign in again.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get user.' });
  }
}
