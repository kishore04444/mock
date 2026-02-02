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

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Production: serve built React app
if (isProd) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong.',
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (in-memory store, no MongoDB required)`);
  if (isProd) console.log('Serving production build from client/dist');
  const hasKey = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder');
  console.log(hasKey ? 'OpenAI API key: configured' : 'OpenAI API key: NOT set - using mock data. Add OPENAI_API_KEY in server/.env for real AI.');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n*** Port ${PORT} is already in use ***`);
    console.error('Close the other app using this port, then run again.');
    console.error('To find what is using it (Windows): netstat -ano | findstr :' + PORT);
    console.error('To kill by PID: taskkill /PID <pid> /F\n');
    process.exit(1);
  }
  throw err;
});
