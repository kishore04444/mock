/**
 * MediaRecorder hook - records video/audio stream
 * Returns chunks and provides start/stop/download functionality
 */
import { useState, useRef, useCallback } from 'react';

export function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback((stream) => {
    if (!stream) {
      setError('No stream provided');
      return false;
    }
    try {
      chunksRef.current = [];
      setRecordingUrl(null);
      setError(null);

      // Try different MIME types for browser compatibility
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setIsRecording(false);
      };

      recorder.onerror = (e) => {
        setError('Recording error: ' + (e.error?.message || 'Unknown error'));
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      return true;
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const getRecordingBlob = useCallback(() => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: 'video/webm' });
  }, []);

  const downloadRecording = useCallback((filename = 'interview-recording.webm') => {
    if (!recordingUrl) return;
    const a = document.createElement('a');
    a.href = recordingUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [recordingUrl]);

  const clearRecording = useCallback(() => {
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    setRecordingUrl(null);
    chunksRef.current = [];
  }, [recordingUrl]);

  return {
    isRecording,
    recordingUrl,
    error,
    startRecording,
    stopRecording,
    getRecordingBlob,
    downloadRecording,
    clearRecording,
  };
}
