"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Plus,
  MessageSquare,
  Settings,
  Search,
  Sparkles,
  Compass,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  onOpenSettings?: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  isOpen,
  onToggle,
  userName = "Neezar",
  onOpenSettings,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Group conversations by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isYesterday = (date: Date) => date.toDateString() === yesterday.toDateString();
  const isLastWeek = (date: Date) => date > lastWeek && !isToday(date) && !isYesterday(date);

  const groupedConversations = {
    today: filteredConversations.filter((c) => isToday(c.updatedAt)),
    yesterday: filteredConversations.filter((c) => isYesterday(c.updatedAt)),
    lastWeek: filteredConversations.filter((c) => isLastWeek(c.updatedAt)),
    older: filteredConversations.filter(
      (c) => !isToday(c.updatedAt) && !isYesterday(c.updatedAt) && !isLastWeek(c.updatedAt)
    ),
  };

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim() && onRename) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (id: string) => {
    if (onDelete && confirm("Hapus percakapan ini?")) {
      onDelete(id);
    }
    setMenuOpenId(null);
  };

  const renderConversationGroup = (title: string, convs: Conversation[]) => {
    if (convs.length === 0) return null;
    
    return (
      <div className="mb-4">
        <p className="text-xs text-[var(--text-muted)] px-3 mb-2">{title}</p>
        <div className="space-y-1">
          {convs.map((conv) => (
            <div key={conv.id} className="relative group">
              {editingId === conv.id ? (
                <div className="flex items-center gap-2 p-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="flex-1 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 rounded hover:bg-green-500/20 text-green-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 rounded hover:bg-red-500/20 text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left pr-10 relative",
                    conv.id === activeId
                      ? "bg-[var(--surface)] border-l-2 border-l-[var(--accent)] shadow-sm"
                      : "hover:bg-[var(--surface-hover)] border-l-2 border-l-transparent"
                  )}
                >
                  <MessageSquare className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    conv.id === activeId ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                  )} />
                  <span className={cn(
                    "text-sm truncate transition-colors",
                    conv.id === activeId ? "text-[var(--foreground)] font-medium" : "text-[var(--foreground)]"
                  )}>
                    {truncate(conv.title, 24)}
                  </span>
                </button>
              )}
              
              {editingId !== conv.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                  }}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-opacity",
                    "hover:bg-[var(--surface-hover)]",
                    menuOpenId === conv.id || conv.id === activeId
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <MoreHorizontal className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              )}

              {menuOpenId === conv.id && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 z-50 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[140px]"
                >
                  <button
                    onClick={() => handleStartEdit(conv)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  >
                    <Pencil className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(conv.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50",
          "w-72 bg-[var(--background-secondary)] border-r border-[var(--border)]",
          "transform transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 h-14">
          <button
            onClick={onToggle}
            className="p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
            title="Close sidebar"
          >
            <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "p-2 rounded-full transition-colors",
                showSearch
                  ? "bg-[var(--surface)] text-[var(--accent)]"
                  : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
              )}
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-3 mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--surface-hover)]"
                >
                  <X className="w-3 h-3 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* New Chat Button */}
        <div className="px-3 mb-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-3 w-full p-3 rounded-full border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Plus className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="text-[var(--foreground)]">Percakapan baru</span>
          </button>
        </div>

        {/* Gem Section */}
        <div className="px-3 py-2">
          <p className="text-xs text-[var(--text-muted)] px-3 mb-2">Gem</p>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-[var(--foreground)]">Partner coding</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors">
            <Compass className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="text-[var(--foreground)]">Jelajahi Gem</span>
          </button>
        </div>

        {/* Conversations List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {filteredConversations.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] px-3 py-2">
              {searchQuery ? "Tidak ditemukan" : "Belum ada percakapan"}
            </p>
          ) : (
            <>
              {renderConversationGroup("Hari ini", groupedConversations.today)}
              {renderConversationGroup("Kemarin", groupedConversations.yesterday)}
              {renderConversationGroup("7 hari terakhir", groupedConversations.lastWeek)}
              {renderConversationGroup("Lebih lama", groupedConversations.older)}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)]">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="text-[var(--foreground)]">Setelan & akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
