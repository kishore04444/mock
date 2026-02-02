/**
 * Interview room - camera, mic, questions, speech-to-text, AI evaluation
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { useMediaDevices } from '../hooks/useMediaDevices.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { useMediaRecorder } from '../hooks/useMediaRecorder.js';
import {
  getQuestions,
  evaluateAnswer,
  getFinalFeedback,
} from '../services/interviewService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const MODE_LABEL = { hr: 'HR', technical: 'Technical', behavioral: 'Behavioral' };

export function InterviewRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, resumeAnalysisId } = location.state || {};
  const [step, setStep] = useState('permission'); // permission | questions | done
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [lastEvalFeedback, setLastEvalFeedback] = useState(null); // AI feedback text for current answer
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [finalLoading, setFinalLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const { stream, error: mediaError, startStream, stopStream } = useMediaDevices({
    video: true,
    audio: true,
  });
  const {
    transcript: speechTranscript,
    isListening,
    supported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();
  const {
    isRecording,
    recordingUrl,
    startRecording,
    stopRecording,
    downloadRecording,
  } = useMediaRecorder();

  // Attach stream to video
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Sync transcript from speech hook
  useEffect(() => {
    setTranscript(speechTranscript);
  }, [speechTranscript]);

  // Redirect if no mode
  useEffect(() => {
    if (!mode) {
      navigate('/interview', { replace: true });
    }
  }, [mode, navigate]);

  const handlePermissionGranted = async () => {
    setError('');
    const s = await startStream();
    if (s) {
      // Start recording the interview
      startRecording(s);
      setStep('questions');
      await fetchQuestions();
    } else {
      setError(mediaError || 'Could not access camera/microphone.');
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getQuestions(mode, resumeAnalysisId);
      setInterviewId(data.interviewId);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setFeedback(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load questions. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1 && questions.length > 0;

  const handleSubmitAnswer = async () => {
    if (!interviewId || currentQuestion == null) return;
    const answerText = transcript.trim() || '(No answer provided)';
    setEvalLoading(true);
    setError('');
    try {
      const res = await evaluateAnswer(interviewId, currentIndex, currentQuestion, answerText);
      setLastEvalFeedback(res.feedback);
      setFeedback({ question: currentQuestion, answer: answerText });
      resetTranscript();
      setTranscript(''); // Clear the textarea immediately
      stopListening();
      if (isLastQuestion) {
        setStep('done');
        await requestFinalFeedback();
      } else {
        setCurrentIndex((i) => i + 1);
        setFeedback(null);
        setLastEvalFeedback(null);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to evaluate your answer. Please try again.'));
    } finally {
      setEvalLoading(false);
    }
  };

  const requestFinalFeedback = async () => {
    if (!interviewId) return;
    setFinalLoading(true);
    setError('');
    // Stop recording when interview ends
    stopRecording();
    stopStream();
    try {
      const data = await getFinalFeedback(interviewId);
      setFeedback((f) => ({ ...f, final: data }));
      // Don't navigate immediately - let user download recording first
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to generate feedback. Please try again.'));
    } finally {
      setFinalLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setLastEvalFeedback(null);
    setTranscript('');
    resetTranscript();
    setCurrentIndex((i) => i + 1);
  };

  if (!mode) return null;

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">
          {MODE_LABEL[mode] || mode} Interview
        </h1>

        {/* Step: Camera/Mic permission */}
        {step === 'permission' && (
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm max-w-lg">
            <h2 className="font-semibold text-slate-800 mb-2">Camera & Microphone</h2>
            <p className="text-slate-600 text-sm mb-4">
              Allow camera and microphone so we can record your interview. Your video is shown only to you (preview).
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handlePermissionGranted}
              className="px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
            >
              Allow & Start
            </button>
          </div>
        )}

        {/* Step: Questions + camera + mic + transcript */}
        {step === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Video + mic indicator */}
            <div className="lg:col-span-1 space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-200">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2 z-10">
                  {isRecording && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-600 text-white animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      REC
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      stream ? 'bg-green-600 text-white' : 'bg-slate-600 text-white'
                    }`}
                  >
                    Camera {stream ? 'On' : 'Off'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-600 text-white'
                    }`}
                  >
                    Mic {isListening ? 'Listening' : 'Off'}
                  </span>
                </div>
              </div>
              {!speechSupported && (
                <p className="text-amber-700 text-sm">
                  Speech recognition not supported in this browser. Type your answer in the box below.
                </p>
              )}
            </div>

            {/* Right: Chat-like Q&A */}
            <div className="lg:col-span-2 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              {loading ? (
                <p className="text-slate-500">Loading questions...</p>
              ) : questions.length === 0 ? (
                <p className="text-slate-500">No questions. Try again.</p>
              ) : (
                <>
                  {/* Question */}
                  <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
                    <p className="text-xs text-primary-600 font-medium mb-1">
                      Question {currentIndex + 1} of {questions.length}
                    </p>
                    <p className="text-slate-800 font-medium">{currentQuestion}</p>
                  </div>

                  {/* Live transcription / type answer */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Your answer (speak or type)
                    </label>
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Speak and see live transcription here, or type..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="flex gap-2">
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            isListening
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {isListening ? 'Stop' : 'Start'} voice
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        disabled={evalLoading}
                        className="px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
                      >
                        {evalLoading ? 'Evaluating...' : isLastQuestion ? 'Submit & Finish' : 'Submit answer'}
                      </button>
                    </div>
                  </div>

                  {/* Per-answer feedback (after submit) */}
                  {feedback && feedback.question && !feedback.final && (
                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">AI feedback for this answer</p>
                      {lastEvalFeedback && (
                        <p className="text-slate-600 text-sm mb-2">{lastEvalFeedback}</p>
                      )}
                      <p className="text-slate-500 text-xs">
                        {isLastQuestion ? 'Generating final report...' : 'Click below for next question.'}
                      </p>
                      {!isLastQuestion && (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="mt-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
                        >
                          Next question
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Step: Done - show recording download and results link */}
        {step === 'done' && (
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm max-w-lg space-y-4">
            {finalLoading ? (
              <p className="text-slate-600">Generating your feedback report...</p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Interview completed!</span>
                </div>

                {/* Recording download */}
                {recordingUrl && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Your interview recording</p>
                    <video
                      src={recordingUrl}
                      controls
                      className="w-full rounded-lg mb-3"
                      style={{ maxHeight: '200px' }}
                    />
                    <button
                      type="button"
                      onClick={() => downloadRecording(`interview-${interviewId}-${Date.now()}.webm`)}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 text-sm"
                    >
                      Download recording
                    </button>
                  </div>
                )}

                {!recordingUrl && !isRecording && (
                  <p className="text-slate-500 text-sm">Recording is being processed...</p>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/interview/result/${interviewId}`, { replace: true })}
                  className="w-full py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
                >
                  View detailed feedback
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
