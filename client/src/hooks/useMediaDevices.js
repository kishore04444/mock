/**
 * Camera and microphone access - MediaDevices API
 * Returns stream, error, and permission state
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useMediaDevices(options = { video: true, audio: true }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt'); // prompt | granted | denied
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const startStream = useCallback(async () => {
    stopStream();
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(options);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermission('granted');
      return mediaStream;
    } catch (err) {
      setError(err.message || 'Could not access camera/microphone.');
      setPermission('denied');
      return null;
    }
  }, [options.video, options.audio, stopStream]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return { stream, error, permission, startStream, stopStream };
}
