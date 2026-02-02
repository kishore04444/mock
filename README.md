# AI Mock Interview - MERN Stack Application

A production-ready AI-based mock interview web application. Users upload resumes, get AI analysis, and practice interviews with real-time voice, camera, and AI feedback.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Storage:** In-memory (no MongoDB required — works out of the box)
- **AI:** OpenAI API (optional; uses mock data when key is missing)
- **Media:** WebRTC + MediaDevices API (camera + microphone)
- **Auth:** JWT

## Prerequisites

- Node.js 18+ (no MongoDB or OpenAI key required to run)

## Quick Start

### 1. Install

```bash
cd mockinter
npm run install:all
```

### 2. Run (no env or MongoDB needed)

```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:5000  

### Optional: server/.env

Create `server/.env` (or copy from `server/.env.example`) only if you want:

- **OPENAI_API_KEY** — real AI for resume analysis and interview feedback (otherwise mock data is used)
- **JWT_SECRET** — custom secret (default works for dev)
- **CLIENT_URL** — CORS origin (default http://localhost:5173)

### Production (single server, one port)

```bash
npm run start:prod
```

Builds the client, then runs the server in production mode. Open http://localhost:5000 — the server serves both the API and the built React app. No separate client dev server.

## API Routes

| Method | Route | Description |
|--------|--------|-------------|
| POST | /api/auth/register | User signup |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Current user (protected) |
| POST | /api/resume/upload | Upload resume PDF/DOCX (protected) |
| GET | /api/resume/analyses | List user's resume analyses (protected) |
| GET | /api/resume/analyses/:id | Get one analysis (protected) |
| POST | /api/interview/questions | Get AI interview questions (protected) |
| POST | /api/interview/evaluate | Evaluate answer (protected) |
| POST | /api/interview/feedback | Get final feedback (protected) |
| GET | /api/interview/history | List interview history (protected) |
| GET | /api/interview/history/:id | Get one interview (protected) |
| GET | /api/user/profile | Get/update profile (protected) |

## Project Structure

```
mockinter/
├── client/                 # React (Vite) + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── store/          # in-memory store (no MongoDB)
│   ├── middlewares/
│   ├── services/
│   └── server.js
├── .env.example
└── README.md
```

## Features

- **Auth:** Signup / Login with JWT and protected routes
- **Resume:** Upload PDF/DOCX → extract text → AI analysis (skills, strengths, weaknesses, role fit)
- **Interview:** HR / Technical / Behavioral modes; questions from resume; camera + mic; speech-to-text; AI evaluation
- **Feedback:** Scores (communication, confidence, technical depth) and improvement suggestions
- **Dashboard:** Resume analyses, interview history, scores, profile

## License

MIT
