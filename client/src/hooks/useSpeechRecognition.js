/**
 * Web Speech API - speech to text (browser)
 * Returns transcript, listening state, start/stop
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(!!SpeechRecognition);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript;
      }
      setTranscript(full);
    };
    recognition.onerror = (e) => {
      if (e.error !== 'aborted') setError(e.error);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  return {
    transcript,
    isListening,
    error,
    supported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
