/**
 * Get user-friendly error message from API or network errors
 */
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  const msg = err.response?.data?.message;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (err.response?.status === 400) return 'Invalid request. Please check your input.';
  if (err.response?.status === 401) return 'Invalid email or password.';
  if (err.response?.status === 403) return 'You do not have permission.';
  if (err.response?.status === 404) return 'Not found.';
  if (err.response?.status === 503) return 'Service temporarily unavailable. Please try again.';
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) return 'Request timed out. Please try again.';
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') return 'Network error. Check your connection and try again.';
  if (err.message && typeof err.message === 'string') return err.message;
  return fallback;
}
