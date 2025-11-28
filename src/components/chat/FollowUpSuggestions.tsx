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
    <div className="mt-3 sm:mt-4 space-y-2">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Sparkles className="w-3 h-3" />
        <span>Pertanyaan lanjutan</span>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className={cn(
              "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm",
              "bg-[var(--surface)] hover:bg-[var(--surface-hover)]",
              "border border-[var(--border)] hover:border-[var(--accent)]/50",
              "text-[var(--foreground)] transition-all",
              "hover:shadow-md active:scale-95"
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
