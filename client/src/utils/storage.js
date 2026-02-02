/**
 * Local storage helpers for token and user
 */
import { STORAGE_KEYS } from './constants.js';

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  else localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.USER);
}

export function clearAuth() {
  setToken(null);
  setUser(null);
}
