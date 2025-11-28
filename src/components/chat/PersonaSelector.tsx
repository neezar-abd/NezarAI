"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  Check, 
  Sparkles, 
  Code, 
  GraduationCap, 
  Search, 
  Palette, 
  Wrench 
} from "lucide-react";
import { personas, Persona } from "@/lib/personas";
import { cn } from "@/lib/utils";

// Icon mapping for personas
const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  "graduation-cap": <GraduationCap className="w-5 h-5" />,
  search: <Search className="w-5 h-5" />,
  palette: <Palette className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
};

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onSelect: (persona: Persona) => void;
}

export function PersonaSelector({ selectedPersona, onSelect }: PersonaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors"
      >
        <span className="text-[var(--accent)]">{iconMap[selectedPersona.icon] || <Sparkles className="w-5 h-5" />}</span>
        <span className="text-sm text-[var(--foreground)] font-medium">
          {selectedPersona.name}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--text-secondary)] transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-xs text-[var(--text-muted)] px-3 py-2 font-medium">
                Pilih Persona AI
              </p>
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => {
                    onSelect(persona);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                    selectedPersona.id === persona.id
                      ? "bg-[var(--accent)]/10"
                      : "hover:bg-[var(--surface-hover)]"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br shrink-0",
                      persona.color
                    )}
                  >
                    {iconMap[persona.icon] || <Sparkles className="w-5 h-5" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {persona.name}
                      </span>
                      {selectedPersona.id === persona.id && (
                        <Check className="w-4 h-4 text-[var(--accent)]" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                      {persona.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
