/**
 * Resume upload and analyses API
 */
import api from './api.js';

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getAnalyses() {
  const { data } = await api.get('/resume/analyses');
  return data;
}

export async function getAnalysis(id) {
  const { data } = await api.get(`/resume/analyses/${id}`);
  return data;
}
