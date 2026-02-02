/**
 * Auth state hook - user, loading, login, logout
 */
import { useState, useEffect, useCallback } from 'react';
import { getUser, clearAuth } from '../utils/storage.js';
import { getMe } from '../services/authService.js';

export function useAuth() {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(!!getUser());

  const refreshUser = useCallback(async () => {
    try {
      const u = await getMe();
      setUserState(u);
      return u;
    } catch {
      setUserState(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user._id) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
  }, []);

  return { user, loading, refreshUser, logout };
}
