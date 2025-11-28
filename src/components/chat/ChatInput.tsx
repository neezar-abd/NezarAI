"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import {
  Plus,
  Settings2,
  ChevronDown,
  Mic,
  MicOff,
  Send,
  Square,
  BookTemplate,
  Image,
  X,
  FileImage,
  FileText,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PromptTemplates } from "./PromptTemplates";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { 
  processFile, 
  isFileSupported, 
  formatFileSize, 
  getFileIcon,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE,
  ProcessedFile,
} from "@/lib/fileProcessing";

interface AttachedImage {
  id: string;
  file: File;
  preview: string;
  base64?: string;
}

interface AttachedFile {
  id: string;
  file: File;
  processed?: ProcessedFile;
  isProcessing?: boolean;
}

interface ChatInputProps {
  onSendMessage: (message: string, images?: AttachedImage[], files?: AttachedFile[]) => void;
  isLoading: boolean;
  onStop?: () => void;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  onStop,
  placeholder = "Minta NezarAI",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("Penalaran");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Input Hook
  const { 
    isListening, 
    isSupported: voiceSupported, 
    transcript, 
    toggleListening,
    error: voiceHookError,
  } = useVoiceInput({
    onResult: (result) => {
      setMessage((prev) => prev + (prev ? " " : "") + result);
      textareaRef.current?.focus();
    },
    onError: (err) => {
      setVoiceError(err);
      setTimeout(() => setVoiceError(null), 3000);
    },
    language: "id-ID",
  });

  // Update message with interim transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      // Show interim transcript in a different way or update message
    }
  }, [isListening, transcript]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/xxx;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: AttachedImage[] = [];
    
    for (let i = 0; i < files.length && attachedImages.length + newImages.length < 5; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        const base64 = await fileToBase64(file);
        newImages.push({
          id: `${Date.now()}-${i}`,
          file,
          preview,
          base64,
        });
      }
    }

    setAttachedImages((prev) => [...prev, ...newImages]);
    setShowAttachMenu(false);
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length && attachedFiles.length + newFiles.length < 3; i++) {
      const file = files[i];
      if (isFileSupported(file) && file.size <= MAX_FILE_SIZE) {
        const attachedFile: AttachedFile = {
          id: `file-${Date.now()}-${i}`,
          file,
          isProcessing: true,
        };
        newFiles.push(attachedFile);
      }
    }

    // Add files first (with processing state)
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    setShowAttachMenu(false);

    // Process files in background
    for (const attachedFile of newFiles) {
      const processed = await processFile(attachedFile.file);
      setAttachedFiles((prev) =>
        prev.map((f) =>
          f.id === attachedFile.id
            ? { ...f, processed, isProcessing: false }
            : f
        )
      );
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setAttachedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // Revoke object URL to free memory
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    const hasContent = message.trim() || attachedImages.length > 0 || attachedFiles.length > 0;
    const filesReady = attachedFiles.every((f) => !f.isProcessing);
    
    if (hasContent && !isLoading && filesReady) {
      onSendMessage(
        message.trim(), 
        attachedImages.length > 0 ? attachedImages : undefined,
        attachedFiles.length > 0 ? attachedFiles : undefined
      );
      setMessage("");
      setAttachedImages([]);
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const modelOptions = ["Penalaran", "Kreatif", "Seimbang"];

  const handleTemplateSelect = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const hasAttachments = attachedImages.length > 0 || attachedFiles.length > 0;
  const canSend = (message.trim() || hasAttachments) && attachedFiles.every((f) => !f.isProcessing);

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={SUPPORTED_EXTENSIONS.join(",")}
        multiple
        className="hidden"
      />

      {/* Prompt Templates Modal */}
      <PromptTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />

      <div className="relative bg-[var(--surface)] rounded-3xl border border-[var(--border)] focus-within:border-[var(--accent)]/50 transition-colors">
        {/* Attachments Preview */}
        {hasAttachments && (
          <div className="px-4 pt-4 flex flex-wrap gap-2">
            {/* Image previews */}
            {attachedImages.map((img) => (
              <div
                key={img.id}
                className="relative group w-20 h-20 rounded-lg overflow-hidden bg-[var(--surface-hover)]"
              >
                <img
                  src={img.preview}
                  alt="Attached"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* File previews */}
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="relative group flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-hover)] max-w-[200px]"
              >
                <span className="text-lg">{getFileIcon(file.file.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)] truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {file.isProcessing ? "Memproses..." : formatFileSize(file.file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 rounded-full hover:bg-[var(--border)] transition-colors"
                >
                  <X className="w-3 h-3 text-[var(--text-secondary)]" />
                </button>
                {file.processed?.error && (
                  <div className="absolute -bottom-1 left-0 right-0 text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                    {file.processed.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasAttachments ? "Tambahkan pesan..." : placeholder}
            disabled={isLoading}
            rows={1}
            className="w-full bg-transparent text-[var(--foreground)] placeholder-[var(--text-muted)] resize-none outline-none text-sm sm:text-base leading-6"
            style={{ minHeight: "24px", maxHeight: "200px" }}
          />
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between px-1 sm:px-2 pb-2">
          {/* Left Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Attachment Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
                title="Tambahkan lampiran"
              >
                <Plus className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
              
              {showAttachMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAttachMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-20 min-w-[200px] overflow-hidden">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <Image className="w-4 h-4 text-blue-500" />
                      <div>
                        <p>Upload gambar</p>
                        <p className="text-xs text-[var(--text-muted)]">JPG, PNG, GIF, WebP</p>
                      </div>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors border-t border-[var(--border)]"
                    >
                      <FileText className="w-4 h-4 text-green-500" />
                      <div>
                        <p>Upload file</p>
                        <p className="text-xs text-[var(--text-muted)]">PDF, TXT, Code, dll</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
              title="Prompt Templates"
            >
              <BookTemplate className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-secondary)] hidden sm:inline">Templates</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Model Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
              >
                <span className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  {selectedModel}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-secondary)]" />
              </button>

              {/* Dropdown Menu */}
              {showModelDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowModelDropdown(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-20 min-w-[150px] overflow-hidden">
                    {modelOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedModel(option);
                          setShowModelDropdown(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors",
                          option === selectedModel
                            ? "text-[var(--accent)]"
                            : "text-[var(--foreground)]"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Microphone */}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "hover:bg-[var(--surface-hover)]"
                )}
                title={isListening ? "Berhenti merekam" : "Input suara"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 text-white" />
                    {/* Pulsing animation */}
                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                  </>
                ) : (
                  <Mic className="w-5 h-5 text-[var(--text-secondary)]" />
                )}
              </button>
            )}

            {/* Voice Error Toast */}
            {voiceError && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-red-500/90 text-white text-sm rounded-lg whitespace-nowrap">
                {voiceError}
              </div>
            )}

            {/* Listening indicator */}
            {isListening && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-red-500 text-white text-sm rounded-lg flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Mendengarkan...
              </div>
            )}

            {/* Send/Stop Button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="p-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
                title="Hentikan"
              >
                <Square className="w-5 h-5 text-[var(--background)]" fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSend}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  canSend
                    ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                    : "bg-[var(--surface-hover)]"
                )}
                title="Kirim pesan"
              >
                <Send
                  className={cn(
                    "w-5 h-5",
                    canSend
                      ? "text-[var(--background)]"
                      : "text-[var(--text-muted)]"
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-3">
        NezarAI dapat membuat kesalahan. Periksa info penting.
      </p>
    </div>
  );
}

// Export types for use in other components
export type { AttachedImage, AttachedFile };
