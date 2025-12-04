"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
}

export function FollowUpSuggestions({
  suggestions,
  onSelect,
  isLoading = false,
}: FollowUpSuggestionsProps) {
  if (suggestions.length === 0 || isLoading) return null;

  return (
    <div className="mt-4 sm:mt-6 space-y-3 px-2 sm:px-0">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Pertanyaan lanjutan</span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className={cn(
              "px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-sm",
              "bg-[var(--surface)] hover:bg-[var(--surface-hover)]",
              "border border-[var(--border)] hover:border-[var(--accent)]/50",
              "text-[var(--foreground)] transition-all leading-snug",
              "hover:shadow-md active:scale-[0.98]"
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
