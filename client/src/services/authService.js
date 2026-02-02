/**
 * Auth API calls
 */
import api from './api.js';
import { setToken, setUser } from '../utils/storage.js';

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  setToken(data.token);
  setUser({ _id: data._id, name: data.name, email: data.email });
  return data;
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  setToken(data.token);
  setUser({ _id: data._id, name: data.name, email: data.email });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  setUser(data);
  return data;
}
