/**
 * Mock Interview API - Express server (in-memory store, no MongoDB required)
 * In production, serves the built client from client/dist.
 */

import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

/* =========================
   CORS CONFIG (IMPORTANT)
   ========================= */
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://shiny-pavlova-7f0817.netlify.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());



/* =========================
   MIDDLEWARE
   ========================= */
app.use(express.json());

/* =========================
   API ROUTES
   ========================= */
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

/* =========================
   PRODUCTION: SERVE FRONTEND
   ========================= */
if (isProd) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');

  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

/* =========================
   ERROR HANDLER
   ========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong.',
  });
});

/* =========================
   START SERVER
   ========================= */
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (isProd) console.log('Production mode enabled');

  const hasKey =
    process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.includes('placeholder');

  console.log(
    hasKey
      ? 'OpenAI API key: configured'
      : 'OpenAI API key: NOT set (using mock data)'
  );
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
  throw err;
});
