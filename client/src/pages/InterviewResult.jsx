/**
 * Interview result - scores, feedback, improvement suggestions
 */
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { getInterview } from '../services/interviewService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const MODE_LABEL = { hr: 'HR', technical: 'Technical', behavioral: 'Behavioral' };

export function InterviewResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getInterview(id)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Interview not found.')))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p className="text-slate-500">Loading...</p></Layout>;
  if (error || !data) {
    return (
      <Layout>
        <div className="p-4 rounded-lg bg-red-50 text-red-700">
          <p className="font-medium">{error || 'Not found.'}</p>
          <Link to="/dashboard" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
            ← Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const scores = data.scores || {};
  const qa = data.qa || [];

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-primary-600 hover:underline text-sm">
            ← Dashboard
          </Link>
          <Link to="/interview" className="text-primary-600 hover:underline text-sm">
            New interview
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {MODE_LABEL[data.mode] || data.mode} Interview – Results
        </h1>
        <p className="text-slate-500 text-sm">
          {new Date(data.createdAt).toLocaleString()}
        </p>

        {/* Scores */}
        {(scores.communication != null || scores.confidence != null || scores.technicalDepth != null) && (
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Scores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'communication', label: 'Communication' },
                { key: 'confidence', label: 'Confidence' },
                { key: 'technicalDepth', label: 'Technical depth' },
              ].map(({ key, label }) => (
                <div key={key} className="p-4 rounded-lg bg-slate-50">
                  <p className="text-slate-500 text-sm">{label}</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {scores[key] != null ? scores[key] : '–'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Overall feedback */}
        {data.overallFeedback && (
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-2">Overall feedback</h2>
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{data.overallFeedback}</p>
          </section>
        )}

        {/* Improvement suggestions */}
        {data.improvementSuggestions?.length > 0 && (
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-2">Improvement suggestions</h2>
            <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
              {data.improvementSuggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Q&A history */}
        {qa.length > 0 && (
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Questions & answers</h2>
            <ul className="space-y-4">
              {qa.map((item, i) => (
                <li key={i} className="border-b border-slate-100 pb-4 last:border-0">
                  <p className="text-slate-700 font-medium text-sm">Q: {item.question}</p>
                  <p className="text-slate-600 text-sm mt-1">A: {item.userAnswer || '–'}</p>
                  {item.aiFeedback && (
                    <p className="text-primary-700 text-sm mt-2 italic">Feedback: {item.aiFeedback}</p>
                  )}
                  {item.score != null && (
                    <p className="text-slate-500 text-xs mt-1">Score: {item.score}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Layout>
  );
}
