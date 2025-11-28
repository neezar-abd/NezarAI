"use client";

import { useState, useEffect } from "react";
import { Pin, X, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinnedContext {
  id: string;
  content: string;
}

interface ContextPinningProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedContexts: PinnedContext[];
  onUpdate: (contexts: PinnedContext[]) => void;
}

const defaultSuggestions = [
  "Saya menggunakan React + TypeScript + Tailwind CSS",
  "Saya menggunakan Next.js 14 dengan App Router",
  "Saya menggunakan Python dengan FastAPI",
  "Saya lebih suka penjelasan dalam Bahasa Indonesia",
  "Saya pemula dalam programming",
  "Saya experienced developer",
];

export function ContextPinning({
  isOpen,
  onClose,
  pinnedContexts,
  onUpdate,
}: ContextPinningProps) {
  const [newContext, setNewContext] = useState("");

  if (!isOpen) return null;

  const addContext = (content: string) => {
    if (content.trim()) {
      const newItem: PinnedContext = {
        id: Date.now().toString(),
        content: content.trim(),
      };
      onUpdate([...pinnedContexts, newItem]);
      setNewContext("");
    }
  };

  const removeContext = (id: string) => {
    onUpdate(pinnedContexts.filter((c) => c.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addContext(newContext);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[80vh] bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Context Pinning
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Description */}
        <div className="px-4 py-3 bg-[var(--surface)]/50 border-b border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)]">
            Pin informasi yang ingin selalu diingat AI dalam setiap percakapan.
            Konteks ini akan ditambahkan ke setiap prompt secara otomatis.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Pinned Items */}
          {pinnedContexts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Konteks Aktif
              </p>
              {pinnedContexts.map((ctx) => (
                <div
                  key={ctx.id}
                  className="flex items-start gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg group"
                >
                  <Pin className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
                  <p className="flex-1 text-sm text-[var(--foreground)]">
                    {ctx.content}
                  </p>
                  <button
                    onClick={() => removeContext(ctx.id)}
                    className="p-1 rounded hover:bg-[var(--surface-hover)] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Context */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Tambah Konteks Baru
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Contoh: Saya menggunakan Vue.js 3"
                className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50"
              />
              <button
                onClick={() => addContext(newContext)}
                disabled={!newContext.trim()}
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors flex items-center gap-1",
                  newContext.trim()
                    ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                    : "bg-[var(--surface)] text-[var(--text-muted)]"
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Saran Cepat
            </p>
            <div className="flex flex-wrap gap-2">
              {defaultSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => addContext(suggestion)}
                  className="px-3 py-1.5 text-xs bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-full text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan & Tutup
          </button>
        </div>
      </div>
    </>
  );
}

// Hook for managing pinned contexts
export function usePinnedContexts() {
  const [pinnedContexts, setPinnedContexts] = useState<PinnedContext[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pinnedContexts");
    if (saved) {
      try {
        setPinnedContexts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse pinned contexts:", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("pinnedContexts", JSON.stringify(pinnedContexts));
  }, [pinnedContexts]);

  // Get formatted context string for API
  const getContextString = (): string => {
    if (pinnedContexts.length === 0) return "";
    return `\n\nKONTEKS USER (selalu ingat ini):\n${pinnedContexts
      .map((c) => `- ${c.content}`)
      .join("\n")}`;
  };

  return {
    pinnedContexts,
    setPinnedContexts,
    getContextString,
  };
}
