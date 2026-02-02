/**
 * User profile - name, email (read-only)
 */
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout.jsx';
import api from '../services/api.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/user/profile')
      .then((res) => setUser(res.data))
      .catch((err) => setError(getErrorMessage(err, 'Could not load profile.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p className="text-slate-500">Loading...</p></Layout>;
  if (error || !user) {
    return (
      <Layout>
        <div className="p-4 rounded-lg bg-red-50 text-red-700">
          <p className="font-medium">{error || 'Could not load profile.'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500">Name</label>
            <p className="text-slate-800 font-medium">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Email</label>
            <p className="text-slate-800 font-medium">{user.email}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
