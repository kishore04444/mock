/**
 * In-memory store - no MongoDB required. Data resets on server restart.
 */
import bcrypt from 'bcryptjs';

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const users = new Map();
const usersByEmail = new Map();
const resumeAnalyses = [];
const interviews = [];

// --- Users ---
export async function createUser({ name, email, password }) {
  const hashed = await bcrypt.hash(password, 12);
  const _id = id();
  const user = {
    _id,
    name: (name || '').trim(),
    email: (email || '').toLowerCase().trim(),
    password: hashed,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.set(_id, user);
  usersByEmail.set(user.email, user);
  return user;
}

export async function findUserByEmail(email) {
  return usersByEmail.get((email || '').toLowerCase().trim()) || null;
}

export async function findUserById(_id) {
  const u = users.get(_id);
  if (!u) return null;
  return { _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt };
}

export async function comparePassword(user, candidatePassword) {
  const u = users.get(user._id);
  return u ? bcrypt.compare(candidatePassword, u.password) : false;
}

// --- Resume analyses ---
export async function createResumeAnalysis(doc) {
  const _id = id();
  const row = {
    _id,
    user: doc.user,
    originalFilename: doc.originalFilename,
    extractedText: doc.extractedText,
    analysis: doc.analysis || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  resumeAnalyses.unshift(row);
  return row;
}

export async function findResumeAnalysesByUser(userId) {
  return resumeAnalyses
    .filter((r) => r.user === userId)
    .map((r) => ({
      _id: r._id,
      user: r.user,
      originalFilename: r.originalFilename,
      analysis: r.analysis,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
}

export async function findResumeAnalysisByIdAndUser(id, userId) {
  const r = resumeAnalyses.find((x) => x._id === id && x.user === userId);
  return r ? { ...r } : null;
}

// --- Interviews ---
export async function createInterview(doc) {
  const _id = id();
  const row = {
    _id,
    user: doc.user,
    resumeAnalysis: doc.resumeAnalysis || null,
    mode: doc.mode,
    questions: doc.questions || [],
    qa: [],
    scores: null,
    overallFeedback: null,
    improvementSuggestions: [],
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  interviews.unshift(row);
  return row;
}

export async function findInterviewByIdAndUser(id, userId) {
  return interviews.find((x) => x._id === id && x.user === userId) || null;
}

export async function updateInterview(id, userId, update) {
  const i = interviews.find((x) => x._id === id && x.user === userId);
  if (!i) return null;
  Object.assign(i, update, { updatedAt: new Date() });
  return i;
}

export async function findInterviewsByUser(userId) {
  return interviews
    .filter((i) => i.user === userId)
    .map((i) => {
      const r = { ...i };
      if (r.resumeAnalysis) {
        const ra = resumeAnalyses.find((x) => x._id === r.resumeAnalysis);
        r.resumeAnalysis = ra ? { _id: ra._id, originalFilename: ra.originalFilename, createdAt: ra.createdAt } : null;
      }
      return r;
    });
}
