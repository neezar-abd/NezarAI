"use client";

import { useState } from "react";
import { 
  BookTemplate, 
  X, 
  Search,
  BookOpen,
  Bug,
  CheckCircle,
  Zap,
  RefreshCw,
  Lightbulb,
  Scale,
  Map,
  FileText,
  Clipboard,
  GitCommit,
  Target,
  Plug,
  Database,
  Code,
  PenTool,
  Rocket
} from "lucide-react";
import { promptTemplates, templateCategories, PromptTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

// Icon mapping for templates
const iconMap: Record<string, React.ReactNode> = {
  search: <Search className="w-5 h-5" />,
  "book-open": <BookOpen className="w-5 h-5" />,
  bug: <Bug className="w-5 h-5" />,
  "check-circle": <CheckCircle className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  "refresh-cw": <RefreshCw className="w-5 h-5" />,
  lightbulb: <Lightbulb className="w-5 h-5" />,
  scale: <Scale className="w-5 h-5" />,
  map: <Map className="w-5 h-5" />,
  "file-text": <FileText className="w-5 h-5" />,
  clipboard: <Clipboard className="w-5 h-5" />,
  "git-commit": <GitCommit className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  plug: <Plug className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  "pen-tool": <PenTool className="w-5 h-5" />,
  rocket: <Rocket className="w-5 h-5" />,
};

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptTemplates({ onSelect, isOpen, onClose }: PromptTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("coding");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredTemplates = promptTemplates.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (template: PromptTemplate) => {
    onSelect(template.prompt);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[80vh] bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BookTemplate className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Prompt Templates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Cari template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 p-4 border-b border-[var(--border)] overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
              selectedCategory === "all"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            Semua
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5",
                selectedCategory === cat.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <span>{iconMap[cat.icon]}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className="flex items-start gap-3 p-4 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)]/30 rounded-xl transition-all text-left group"
              >
                <span className="text-[var(--accent)]">{iconMap[template.icon] || <FileText className="w-5 h-5" />}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-[var(--text-muted)]">
              Tidak ada template yang cocok
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Klik template untuk menggunakannya - Edit placeholder [TEXT] sesuai kebutuhan
          </p>
        </div>
      </div>
    </>
  );
}
