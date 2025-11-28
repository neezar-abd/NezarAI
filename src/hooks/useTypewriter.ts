"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number; // ms per character
  enabled?: boolean;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 12,
  enabled = true,
  onComplete,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Refs untuk tracking state tanpa re-render
  const targetTextRef = useRef(text);
  const displayedIndexRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // Update target text saat prop berubah
  useEffect(() => {
    targetTextRef.current = text;
  }, [text]);

  // Main typing animation loop menggunakan requestAnimationFrame
  const animate = useCallback((timestamp: number) => {
    if (!enabled) {
      setDisplayedText(targetTextRef.current);
      displayedIndexRef.current = targetTextRef.current.length;
      setIsComplete(true);
      setIsTyping(false);
      return;
    }

    const targetText = targetTextRef.current;
    const currentIndex = displayedIndexRef.current;

    // Jika sudah mencapai target
    if (currentIndex >= targetText.length) {
      setIsTyping(false);
      if (currentIndex > 0 && targetText.length > 0) {
        setIsComplete(true);
      }
      // Tetap loop untuk menunggu text baru dari stream
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    // Hitung berapa karakter yang harus ditampilkan berdasarkan waktu
    const elapsed = timestamp - lastTimeRef.current;
    
    if (elapsed >= speed) {
      // Tampilkan karakter berikutnya
      const charsToAdd = Math.max(1, Math.floor(elapsed / speed));
      const newIndex = Math.min(currentIndex + charsToAdd, targetText.length);
      
      displayedIndexRef.current = newIndex;
      setDisplayedText(targetText.slice(0, newIndex));
      setIsTyping(true);
      setIsComplete(false);
      lastTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [enabled, speed]);

  // Start animation loop
  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      displayedIndexRef.current = text.length;
      setIsComplete(true);
      setIsTyping(false);
      return;
    }

    // Reset jika text berubah total (bukan append)
    if (!text.startsWith(displayedText.slice(0, Math.min(displayedText.length, text.length)))) {
      displayedIndexRef.current = 0;
      setDisplayedText("");
    }

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, animate, text, displayedText]);

  // Call onComplete when finished
  useEffect(() => {
    if (isComplete && !isTyping && displayedText === text && text.length > 0) {
      onComplete?.();
    }
  }, [isComplete, isTyping, displayedText, text, onComplete]);

  return {
    displayedText,
    isTyping,
    isComplete,
  };
}
