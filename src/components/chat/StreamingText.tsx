"use client";

import { useEffect, useRef, useState, memo } from "react";

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  speed?: number; // ms per character (default: 10)
}

/**
 * Komponen untuk menampilkan teks streaming dengan efek typewriter yang smooth.
 * Menggunakan pendekatan buffer: token dari API dikumpulkan, lalu ditampilkan
 * huruf per huruf dengan interval yang konsisten.
 */
export const StreamingText = memo(function StreamingText({
  content,
  isStreaming,
  speed = 10,
}: StreamingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const displayedLengthRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Jika tidak streaming, tampilkan semua teks langsung
    if (!isStreaming) {
      if (containerRef.current) {
        containerRef.current.textContent = content;
      }
      displayedLengthRef.current = content.length;
      return;
    }

    const animate = (timestamp: number) => {
      if (!containerRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const targetLength = content.length;
      const currentLength = displayedLengthRef.current;

      // Jika sudah mencapai target, tunggu konten baru
      if (currentLength >= targetLength) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Hitung karakter yang perlu ditambahkan berdasarkan waktu
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= speed) {
        // Tambahkan karakter
        const charsToAdd = Math.max(1, Math.floor(elapsed / speed));
        const newLength = Math.min(currentLength + charsToAdd, targetLength);

        // Update DOM langsung tanpa React re-render
        containerRef.current.textContent = content.slice(0, newLength);
        displayedLengthRef.current = newLength;
        lastTimeRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Mulai animasi
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [content, isStreaming, speed]);

  // Reset saat konten berubah total (bukan append)
  useEffect(() => {
    const currentDisplayed = containerRef.current?.textContent || "";
    
    // Jika konten baru tidak dimulai dengan yang sudah ditampilkan, reset
    if (content.length > 0 && !content.startsWith(currentDisplayed.slice(0, Math.min(currentDisplayed.length, 50)))) {
      displayedLengthRef.current = 0;
      if (containerRef.current) {
        containerRef.current.textContent = "";
      }
    }
  }, [content]);

  // Saat streaming selesai, pastikan semua teks ditampilkan
  useEffect(() => {
    if (!isStreaming && containerRef.current) {
      containerRef.current.textContent = content;
      displayedLengthRef.current = content.length;
    }
  }, [isStreaming, content]);

  return <span ref={containerRef} />;
});
