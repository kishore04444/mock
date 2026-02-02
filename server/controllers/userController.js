/**
 * User controller - profile (uses in-memory store)
 */
import * as store from '../store/memoryStore.js';

/**
 * GET /api/user/profile - protected
 */
export async function getProfile(req, res) {
  try {
    const user = await store.findUserById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get profile.' });
  }
}
