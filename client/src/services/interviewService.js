/**
 * Interview API - questions, evaluate, feedback, history
 */
import api from './api.js';

export async function getQuestions(mode, resumeAnalysisId) {
  const { data } = await api.post('/interview/questions', {
    mode,
    resumeAnalysisId: resumeAnalysisId || undefined,
  });
  return data;
}

export async function evaluateAnswer(interviewId, questionIndex, question, userAnswer) {
  const { data } = await api.post('/interview/evaluate', {
    interviewId,
    questionIndex,
    question,
    userAnswer,
  });
  return data;
}

export async function getFinalFeedback(interviewId) {
  const { data } = await api.post('/interview/feedback', { interviewId });
  return data;
}

export async function getInterviewHistory() {
  const { data } = await api.get('/interview/history');
  return data;
}

export async function getInterview(id) {
  const { data } = await api.get(`/interview/history/${id}`);
  return data;
}
