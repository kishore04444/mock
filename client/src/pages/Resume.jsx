/**
 * Resume upload and list of analyses
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { uploadResume, getAnalyses } from '../services/resumeService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function Resume() {
  const [analyses, setAnalyses] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => getAnalyses().then(setAnalyses).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (e) => {
    setError('');
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Only PDF and DOCX files are allowed.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or DOCX file.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      await uploadResume(file);
      setFile(null);
      e.target.reset();
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Resume Analysis</h1>
        <p className="text-slate-500">
          Upload your resume (PDF or DOCX). AI will analyze skills, strengths, weaknesses, and role suitability.
        </p>

        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Choose file (PDF or DOCX, max 5MB)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>
        </form>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Your Analyses</h2>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : analyses.length === 0 ? (
            <p className="text-slate-500 text-sm">No analyses yet.</p>
          ) : (
            <ul className="space-y-2">
              {analyses.map((a) => (
                <li key={a._id}>
                  <Link
                    to={`/resume/${a._id}`}
                    className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-primary-300"
                  >
                    <span className="font-medium text-slate-800">{a.originalFilename}</span>
                    <span className="text-slate-500 text-sm ml-2">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
