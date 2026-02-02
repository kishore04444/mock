/**
 * Wraps routes that require authentication
 */
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../utils/storage.js';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
