/**
 * App constants
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const INTERVIEW_MODES = [
  { value: 'hr', label: 'HR Interview', desc: 'General fit & motivation' },
  { value: 'technical', label: 'Technical Interview', desc: 'Skills & problem-solving' },
  { value: 'behavioral', label: 'Behavioral Interview', desc: 'STAR format & past behavior' },
];

export const STORAGE_KEYS = {
  TOKEN: 'mockinterview_token',
  USER: 'mockinterview_user',
};
