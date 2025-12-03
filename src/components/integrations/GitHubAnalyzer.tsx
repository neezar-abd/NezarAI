"use client";

import { useState, useCallback } from "react";
import { Github, Loader2, Code, FileSearch, HelpCircle, X, Star, GitFork, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";

interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  issues: number;
  languages: string[];
  url: string;
  owner: {
    login: string;
    avatar: string;
  };
}

interface GitHubAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisGenerated: (analysis: string, repoInfo: RepoInfo) => void;
}

type ActionType = "analyze" | "review" | "explain" | "question";

export function GitHubAnalyzer({ isOpen, onClose, onAnalysisGenerated }: GitHubAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [question, setQuestion] = useState("");

  // Fetch repo info when URL changes
  const fetchRepoInfo = useCallback(async (repoUrl: string) => {
    if (!repoUrl) {
      setRepoInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/github?url=${encodeURIComponent(repoUrl)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch repository info");
      }

      setRepoInfo(data);
    } catch (err: any) {
      setError(err.message);
      setRepoInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle URL input
  const handleUrlChange = (value: string) => {
    setUrl(value);
    setAnalysis("");
    
    // Check if it looks like a GitHub URL or owner/repo format
    if (value.includes("github.com") || value.match(/^[^\/\s]+\/[^\/\s]+$/)) {
      fetchRepoInfo(value);
    } else {
      setRepoInfo(null);
    }
  };

  // Generate analysis
  const handleGenerate = async (action: ActionType) => {
    if (!url || !repoInfo) return;

    setIsGenerating(true);
    setAnalysis("");
    setError(null);

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url, 
          action,
          question: action === "question" ? question : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate analysis");
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
                setAnalysis(fullText);
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
    if (analysis && repoInfo) {
      onAnalysisGenerated(analysis, repoInfo);
      onClose();
    }
  };

  // Reset state
  const handleClose = () => {
    setUrl("");
    setRepoInfo(null);
    setAnalysis("");
    setError(null);
    setQuestion("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Github className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">GitHub Analyzer</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Analisis repository GitHub dengan AI</p>
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
              URL Repository GitHub
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://github.com/owner/repo atau owner/repo"
              className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Repo Preview */}
          {repoInfo && (
            <div className="bg-[var(--muted)] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <img
                  src={repoInfo.owner.avatar}
                  alt={repoInfo.owner.login}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <a
                    href={repoInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--foreground)] hover:text-purple-500 transition-colors flex items-center gap-1"
                  >
                    {repoInfo.fullName}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">
                    {repoInfo.description || "Tidak ada deskripsi"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{repoInfo.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <GitFork className="w-4 h-4" />
                      <span>{repoInfo.forks.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <AlertCircle className="w-4 h-4" />
                      <span>{repoInfo.issues}</span>
                    </div>
                  </div>
                  {repoInfo.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {repoInfo.languages.slice(0, 5).map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {repoInfo && !analysis && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleGenerate("analyze")}
                  disabled={isGenerating}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                    "bg-[var(--muted)] border-[var(--border)] hover:border-purple-500/50 hover:bg-purple-500/10",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FileSearch className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-[var(--foreground)]">Analisis</span>
                </button>
                <button
                  onClick={() => handleGenerate("review")}
                  disabled={isGenerating}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                    "bg-[var(--muted)] border-[var(--border)] hover:border-purple-500/50 hover:bg-purple-500/10",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Code className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-[var(--foreground)]">Code Review</span>
                </button>
                <button
                  onClick={() => handleGenerate("explain")}
                  disabled={isGenerating}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                    "bg-[var(--muted)] border-[var(--border)] hover:border-purple-500/50 hover:bg-purple-500/10",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <HelpCircle className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-[var(--foreground)]">Jelaskan</span>
                </button>
              </div>

              {/* Custom Question */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Tanya tentang repo ini..."
                  className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  onClick={() => handleGenerate("question")}
                  disabled={isGenerating || !question}
                  className={cn(
                    "px-4 py-2 bg-purple-500 rounded-xl text-sm font-medium text-white hover:bg-purple-600 transition-colors",
                    (isGenerating || !question) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Tanya
                </button>
              </div>
            </div>
          )}

          {/* Generating Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menganalisis repository...</span>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && (
            <div className="space-y-3">
              <div className="p-4 bg-[var(--muted)] rounded-xl max-h-[400px] overflow-y-auto">
                <MarkdownRenderer content={analysis} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAnalysis("")}
                  className="flex-1 py-2 px-4 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Analisis Lagi
                </button>
                <button
                  onClick={handleSendToChat}
                  className="flex-1 py-2 px-4 bg-purple-500 rounded-xl text-sm font-medium text-white hover:bg-purple-600 transition-colors"
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
