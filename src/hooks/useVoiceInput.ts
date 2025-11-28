"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useVoiceInput({
  onResult,
  onError,
  language = "id-ID", // Default: Bahasa Indonesia
  continuous = false,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  // Check if browser supports Speech Recognition
  useEffect(() => {
    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we have a final transcript, call onResult
        if (finalTranscriptRef.current) {
          onResult?.(finalTranscriptRef.current);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        let errorMessage = "Terjadi kesalahan";
        
        switch (event.error) {
          case "no-speech":
            errorMessage = "Tidak ada suara terdeteksi";
            break;
          case "audio-capture":
            errorMessage = "Mikrofon tidak tersedia";
            break;
          case "not-allowed":
            errorMessage = "Izin mikrofon ditolak";
            break;
          case "network":
            errorMessage = "Koneksi internet bermasalah";
            break;
          case "aborted":
            errorMessage = ""; // User cancelled, no error message
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        if (errorMessage) {
          setError(errorMessage);
          onError?.(errorMessage);
        }
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Update final transcript
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        // Show interim + final
        setTranscript(finalTranscriptRef.current + interimTranscript);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition tidak didukung");
      return;
    }

    setError(null);
    finalTranscriptRef.current = "";
    setTranscript("");

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Recognition might already be running
      console.error("Speech recognition error:", err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    error,
  };
}


