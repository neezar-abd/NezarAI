"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Sparkles, User, ThumbsUp, ThumbsDown, RotateCcw, Share, Pencil, Check, X } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  enableTypewriter?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function ChatMessage({ 
  message, 
  isStreaming = false,
  enableTypewriter = true,
  onEdit,
  onRegenerate,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Untuk streaming, tampilkan konten langsung tanpa efek tambahan
  // Ini menghindari re-render yang menyebabkan "blocky" appearance
  const contentToShow = message.content;

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing, editContent]);

  const handleStartEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(message.id);
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-4 px-4 py-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for Assistant */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[85%] lg:max-w-[75%]",
          isUser ? "order-first" : ""
        )}
      >
        {isUser ? (
          // User Message
          <div className="relative">
            {isEditing ? (
              // Edit mode
              <div className="bg-[var(--surface)] rounded-2xl px-4 py-3">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    }
                    if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                  className="w-full bg-transparent text-[var(--foreground)] resize-none focus:outline-none min-w-[300px]"
                  rows={1}
                />
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            ) : (
              // Normal display
              <div className="bg-[var(--surface)] rounded-2xl px-4 py-3">
                <p className="text-[var(--foreground)] whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            )}
            
            {/* Edit button for user messages */}
            {!isEditing && onEdit && (
              <button
                onClick={handleStartEdit}
                className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--surface-hover)] transition-all"
                title="Edit pesan"
              >
                <Pencil className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
        ) : (
          // Assistant Message - With markdown
          <div className="space-y-3">
            <div className="text-[var(--foreground)]">
              <MarkdownRenderer content={contentToShow} />
              {/* Blinking cursor saat streaming */}
              {isStreaming && (
                <span className="typewriter-cursor" />
              )}
            </div>

            {/* Action Buttons - Only show when not streaming */}
            {!isStreaming && message.content && (
              <div className="flex items-center gap-1 -ml-2">
                <CopyButton text={message.content} />
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Bagus"
                >
                  <ThumbsUp className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Kurang bagus"
                >
                  <ThumbsDown className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
                <button
                  onClick={handleRegenerate}
                  className={cn(
                    "p-2 rounded-lg hover:bg-white/10 transition-colors",
                    onRegenerate ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  )}
                  title="Regenerate"
                  disabled={!onRegenerate}
                >
                  <RotateCcw className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Bagikan"
                >
                  <Share className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Avatar for User */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
