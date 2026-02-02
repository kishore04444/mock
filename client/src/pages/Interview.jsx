/**
 * Interview mode selection and entry - redirects to InterviewRoom with state
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { INTERVIEW_MODES } from '../utils/constants.js';
import { getAnalyses } from '../services/resumeService.js';

export function Interview() {
  const location = useLocation();
  const [mode, setMode] = useState('');
  const [resumeId, setResumeId] = useState(location.state?.resumeAnalysisId || '');
  const [analyses, setAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAnalyses().then(setAnalyses).catch(() => {});
  }, []);

  const handleStart = () => {
    if (!mode) return;
    navigate('/interview/room', { state: { mode, resumeAnalysisId: resumeId || undefined } });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Start Mock Interview</h1>
        <p className="text-slate-500">
          Choose interview type and optional resume. Questions will be generated from your resume when available.
        </p>

        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Interview type
            </label>
            <div className="grid gap-3">
              {INTERVIEW_MODES.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${
                    mode === m.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.value}
                    checked={mode === m.value}
                    onChange={() => setMode(m.value)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-slate-800">{m.label}</span>
                    <p className="text-slate-500 text-sm mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Use resume for personalized questions (optional)
            </label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No resume</option>
              {analyses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.originalFilename} ({new Date(a.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={!mode}
            className="w-full py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            Continue to interview room
          </button>
        </div>
      </div>
    </Layout>
  );
}
