/**
 * App constants
 */

// Backend API base URL
// 1) Uses Netlify / local env variable if available
// 2) Falls back to Render backend for production
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://mock-sxzl.onrender.com/api';

// Interview modes
export const INTERVIEW_MODES = [
  { value: 'hr', label: 'HR Interview', desc: 'General fit & motivation' },
  { value: 'technical', label: 'Technical Interview', desc: 'Skills & problem-solving' },
  { value: 'behavioral', label: 'Behavioral Interview', desc: 'STAR format & past behavior' },
];

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'mockinterview_token',
  USER: 'mockinterview_user',
};
