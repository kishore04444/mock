/**
 * Dashboard - resume analyses, interview history, quick actions
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { getAnalyses } from '../services/resumeService.js';
import { getInterviewHistory } from '../services/interviewService.js';

export function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoadError('');
    Promise.all([getAnalyses(), getInterviewHistory()])
      .then(([a, i]) => {
        setAnalyses(Array.isArray(a) ? a : []);
        setInterviews(Array.isArray(i) ? i : []);
      })
      .catch(() => setLoadError('Could not load some data. Refresh the page to try again.'))
      .finally(() => setLoading(false));
  }, []);

  const modeLabel = (m) =>
    ({ hr: 'HR', technical: 'Technical', behavioral: 'Behavioral' }[m] || m);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Your resume analyses and interview history
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/resume"
            className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition"
          >
            <h2 className="font-semibold text-slate-800">Upload Resume</h2>
            <p className="text-slate-500 text-sm mt-1">
              Upload PDF or DOCX for AI analysis
            </p>
          </Link>
          <Link
            to="/interview"
            className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition"
          >
            <h2 className="font-semibold text-slate-800">Start Interview</h2>
            <p className="text-slate-500 text-sm mt-1">
              Practice with AI (HR, Technical, Behavioral)
            </p>
          </Link>
        </div>

        {loadError && (
          <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm mb-4">
            {loadError}
          </div>
        )}
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <>
            {/* Resume analyses */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                Resume Analyses
              </h2>
              {analyses.length === 0 ? (
                <p className="text-slate-500 text-sm">No analyses yet. Upload a resume.</p>
              ) : (
                <ul className="space-y-2">
                  {analyses.slice(0, 5).map((a) => (
                    <li key={a._id}>
                      <Link
                        to={`/resume/${a._id}`}
                        className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-primary-300"
                      >
                        <span className="font-medium text-slate-800">
                          {a.originalFilename}
                        </span>
                        <span className="text-slate-500 text-sm ml-2">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Interview history */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                Interview History
              </h2>
              {interviews.length === 0 ? (
                <p className="text-slate-500 text-sm">No interviews yet.</p>
              ) : (
                <ul className="space-y-2">
                  {interviews.slice(0, 5).map((i) => (
                    <li key={i._id}>
                      <Link
                        to={`/interview/result/${i._id}`}
                        className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-primary-300"
                      >
                        <span className="font-medium text-slate-800">
                          {modeLabel(i.mode)} Interview
                        </span>
                        <span className="text-slate-500 text-sm ml-2">
                          {new Date(i.createdAt).toLocaleDateString()} •{' '}
                          {i.status === 'completed'
                            ? `Comm: ${i.scores?.communication ?? '-'} Conf: ${i.scores?.confidence ?? '-'} Tech: ${i.scores?.technicalDepth ?? '-'}`
                            : 'In progress'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
