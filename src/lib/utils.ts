import { type ClassValue, clsx } from "clsx";

// Simple cn function without tailwind-merge (lighter bundle)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format timestamp for messages
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Parse follow-up suggestions from AI response
export function parseFollowUpSuggestions(content: string): {
  cleanContent: string;
  suggestions: string[];
} {
  const suggestionsMatch = content.match(
    /---SUGGESTIONS---\s*\n?\s*(\[[\s\S]*?\])\s*\n?\s*---END_SUGGESTIONS---/
  );

  if (suggestionsMatch) {
    try {
      const suggestions = JSON.parse(suggestionsMatch[1]);
      const cleanContent = content
        .replace(/---SUGGESTIONS---[\s\S]*?---END_SUGGESTIONS---/, "")
        .trim();
      return { cleanContent, suggestions };
    } catch {
      return { cleanContent: content, suggestions: [] };
    }
  }

  return { cleanContent: content, suggestions: [] };
}
