/**
 * Main layout with header and nav
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-primary-600">
            AI Mock Interview
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-slate-600 hover:text-primary-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/resume"
              className="text-slate-600 hover:text-primary-600 font-medium"
            >
              Resume
            </Link>
            <Link
              to="/interview"
              className="text-slate-600 hover:text-primary-600 font-medium"
            >
              Interview
            </Link>
            <Link
              to="/profile"
              className="text-slate-600 hover:text-primary-600 font-medium"
            >
              Profile
            </Link>
            <span className="text-slate-500 text-sm">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
