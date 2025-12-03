"use client";

import { useState, useCallback } from "react";
import { Youtube, Loader2, Play, FileText, Lightbulb, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";

interface VideoInfo {
  videoId: string;
  title: string;
  author: string;
  authorUrl: string;
  thumbnail: string;
  embedUrl: string;
}

interface YouTubeSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  onSummaryGenerated: (summary: string, videoInfo: VideoInfo) => void;
}

type ActionType = "summarize" | "keypoints" | "explain";

export function YouTubeSummary({ isOpen, onClose, onSummaryGenerated }: YouTubeSummaryProps) {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");

  // Fetch video info when URL changes
  const fetchVideoInfo = useCallback(async (videoUrl: string) => {
    if (!videoUrl) {
      setVideoInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/youtube?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch video info");
      }

      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message);
      setVideoInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced URL input handler
  const handleUrlChange = (value: string) => {
    setUrl(value);
    setSummary("");
    
    // Check if it looks like a YouTube URL
    if (value.includes("youtube.com") || value.includes("youtu.be") || value.match(/^[a-zA-Z0-9_-]{11}$/)) {
      fetchVideoInfo(value);
    } else {
      setVideoInfo(null);
    }
  };

  // Generate summary
  const handleGenerate = async (action: ActionType) => {
    if (!url || !videoInfo) return;

    setIsGenerating(true);
    setSummary("");
    setError(null);

    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, action, language: "id" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate summary");
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          // Parse SSE data
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                fullText += text;
                setSummary(fullText);
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send to main chat
  const handleSendToChat = () => {
    if (summary && videoInfo) {
      onSummaryGenerated(summary, videoInfo);
      onClose();
    }
  };

  // Reset state
  const handleClose = () => {
    setUrl("");
    setVideoInfo(null);
    setSummary("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-red-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">YouTube Summary</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Analisis video YouTube dengan AI</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* URL Input */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
              URL Video YouTube
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=... atau ID video"
              className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Video Preview */}
          {videoInfo && (
            <div className="bg-[var(--muted)] rounded-xl overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover"
                />
                <a
                  href={`https://youtube.com/watch?v=${videoInfo.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                >
                  <div className="p-4 bg-red-500 rounded-full group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </a>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-[var(--foreground)] line-clamp-2">{videoInfo.title}</h3>
                <a
                  href={videoInfo.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--muted-foreground)] hover:text-red-500 transition-colors flex items-center gap-1 mt-1"
                >
                  {videoInfo.author}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {videoInfo && !summary && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleGenerate("summarize")}
                disabled={isGenerating}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  "bg-[var(--muted)] border-[var(--border)] hover:border-red-500/50 hover:bg-red-500/10",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-[var(--foreground)]">Ringkasan</span>
              </button>
              <button
                onClick={() => handleGenerate("keypoints")}
                disabled={isGenerating}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  "bg-[var(--muted)] border-[var(--border)] hover:border-red-500/50 hover:bg-red-500/10",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                <Play className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-[var(--foreground)]">Poin Kunci</span>
              </button>
              <button
                onClick={() => handleGenerate("explain")}
                disabled={isGenerating}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  "bg-[var(--muted)] border-[var(--border)] hover:border-red-500/50 hover:bg-red-500/10",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                <Lightbulb className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-[var(--foreground)]">Jelaskan</span>
              </button>
            </div>
          )}

          {/* Generating Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menganalisis video...</span>
            </div>
          )}

          {/* Summary Result */}
          {summary && (
            <div className="space-y-3">
              <div className="p-4 bg-[var(--muted)] rounded-xl max-h-[400px] overflow-y-auto">
                <MarkdownRenderer content={summary} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSummary("")}
                  className="flex-1 py-2 px-4 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Analisis Lagi
                </button>
                <button
                  onClick={handleSendToChat}
                  className="flex-1 py-2 px-4 bg-red-500 rounded-xl text-sm font-medium text-white hover:bg-red-600 transition-colors"
                >
                  Kirim ke Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
