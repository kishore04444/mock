/**
 * App - routes and layout
 */
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Resume } from './pages/Resume.jsx';
import { ResumeDetail } from './pages/ResumeDetail.jsx';
import { Interview } from './pages/Interview.jsx';
import { InterviewRoom } from './pages/InterviewRoom.jsx';
import { InterviewResult } from './pages/InterviewResult.jsx';
import { Profile } from './pages/Profile.jsx';

const TITLES = {
  '/login': 'Sign in - AI Mock Interview',
  '/register': 'Sign up - AI Mock Interview',
  '/dashboard': 'Dashboard - AI Mock Interview',
  '/resume': 'Resume - AI Mock Interview',
  '/interview': 'Interview - AI Mock Interview',
  '/interview/room': 'Interview Room - AI Mock Interview',
  '/interview/result': 'Interview Result - AI Mock Interview',
  '/profile': 'Profile - AI Mock Interview',
};

function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean);
    const base = '/' + (parts.slice(0, 2).join('/') || '');
    document.title = TITLES[base] || TITLES[pathname] || 'AI Mock Interview';
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Resume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume/:id"
          element={
            <ProtectedRoute>
              <ResumeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/room"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/result/:id"
          element={
            <ProtectedRoute>
              <InterviewResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
