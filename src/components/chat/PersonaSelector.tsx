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

// Icon mapping for personas - different sizes for responsive
const getIcon = (iconName: string, sizeClass: string = "w-5 h-5") => {
  const iconComponents: Record<string, React.ElementType> = {
    sparkles: Sparkles,
    code: Code,
    "graduation-cap": GraduationCap,
    search: Search,
    palette: Palette,
    wrench: Wrench,
  };
  const IconComponent = iconComponents[iconName] || Sparkles;
  return <IconComponent className={sizeClass} />;
};

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onSelect: (persona: Persona) => void;
  compact?: boolean;
}

export function PersonaSelector({ selectedPersona, onSelect, compact = false }: PersonaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors",
          compact ? "px-2 py-1.5" : "px-2.5 sm:px-3 py-1.5 sm:py-2"
        )}
      >
        <span className="text-[var(--accent)]">{getIcon(selectedPersona.icon, compact ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5")}</span>
        <span className={cn(
          "text-[var(--foreground)] font-medium truncate max-w-[100px] sm:max-w-none",
          compact ? "text-xs" : "text-xs sm:text-sm"
        )}>
          {selectedPersona.name}
        </span>
        <ChevronDown
          className={cn(
            "text-[var(--text-secondary)] transition-transform shrink-0",
            compact ? "w-3 h-3" : "w-3 h-3 sm:w-4 sm:h-4",
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
          <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden max-h-[60vh] overflow-y-auto">
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
                    "w-full flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors text-left",
                    selectedPersona.id === persona.id
                      ? "bg-[var(--accent)]/10"
                      : "hover:bg-[var(--surface-hover)]"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br shrink-0",
                      persona.color
                    )}
                  >
                    {getIcon(persona.icon, "w-4 h-4 sm:w-5 sm:h-5")}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">
                        {persona.name}
                      </span>
                      {selectedPersona.id === persona.id && (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent)]" />
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
