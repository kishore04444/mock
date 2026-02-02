/**
 * Single resume analysis detail view + download report
 */
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { getAnalysis } from '../services/resumeService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function buildReportText(data) {
  const a = data.analysis || {};
  const lines = [
    `Resume Analysis Report`,
    `File: ${data.originalFilename}`,
    `Analyzed on: ${new Date(data.createdAt).toLocaleString()}`,
    '',
    '--- SUMMARY ---',
    a.summary || 'N/A',
    '',
    '--- SKILLS ---',
    (a.skills && a.skills.length) ? a.skills.join(', ') : 'N/A',
    '',
    '--- STRENGTHS ---',
    (a.strengths && a.strengths.length) ? a.strengths.join('\n') : 'N/A',
    '',
    '--- AREAS TO IMPROVE ---',
    (a.weaknesses && a.weaknesses.length) ? a.weaknesses.join('\n') : 'N/A',
    '',
    '--- ROLE SUITABILITY ---',
    a.roleSuitability || 'N/A',
  ];
  return lines.join('\n');
}

export function ResumeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalysis(id)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Resume analysis not found.')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadReport = () => {
    if (!data) return;
    const text = buildReportText(data);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-report-${(data.originalFilename || 'report').replace(/\.[^.]+$/, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Layout><p className="text-slate-500">Loading...</p></Layout>;
  if (error || !data) {
    return (
      <Layout>
        <div className="p-4 rounded-lg bg-red-50 text-red-700">
          <p className="font-medium">{error || 'Not found.'}</p>
          <Link to="/resume" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
            ← Back to Resume
          </Link>
        </div>
      </Layout>
    );
  }

  const a = data.analysis || {};

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/resume" className="text-primary-600 hover:underline text-sm">
            ← Back to Resume
          </Link>
          <button
            type="button"
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 text-sm"
          >
            Download report (.txt)
          </button>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{data.originalFilename}</h1>
        <p className="text-slate-500 text-sm">
          Analyzed on {new Date(data.createdAt).toLocaleString()}
        </p>

        <div className="grid gap-6">
          {a.summary && (
            <section className="p-4 rounded-xl bg-white border border-slate-200">
              <h2 className="font-semibold text-slate-800 mb-2">Summary</h2>
              <p className="text-slate-600 text-sm">{a.summary}</p>
            </section>
          )}
          {a.skills?.length > 0 && (
            <section className="p-4 rounded-xl bg-white border border-slate-200">
              <h2 className="font-semibold text-slate-800 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {a.skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
          {a.strengths?.length > 0 && (
            <section className="p-4 rounded-xl bg-white border border-slate-200">
              <h2 className="font-semibold text-slate-800 mb-2">Strengths</h2>
              <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                {a.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}
          {a.weaknesses?.length > 0 && (
            <section className="p-4 rounded-xl bg-white border border-slate-200">
              <h2 className="font-semibold text-slate-800 mb-2">Areas to Improve</h2>
              <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                {a.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </section>
          )}
          {a.roleSuitability && (
            <section className="p-4 rounded-xl bg-white border border-slate-200">
              <h2 className="font-semibold text-slate-800 mb-2">Role Suitability</h2>
              <p className="text-slate-600 text-sm">{a.roleSuitability}</p>
            </section>
          )}
        </div>

        <Link
          to="/interview"
          state={{ resumeAnalysisId: data._id }}
          className="inline-block px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          Start Interview with this resume
        </Link>
      </div>
    </Layout>
  );
}
