"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Pin, Settings, Youtube, Github, Calendar } from "lucide-react";
import { Sidebar, Conversation } from "@/components/sidebar/Sidebar";
import { ChatInput, AttachedImage, AttachedFile, ModelSpeed, MODEL_CONFIG } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { PersonaSelector } from "@/components/chat/PersonaSelector";
import { FollowUpSuggestions } from "@/components/chat/FollowUpSuggestions";
import { ContextPinning, usePinnedContexts } from "@/components/chat/ContextPinning";
import { PromptTemplates } from "@/components/chat/PromptTemplates";
import { RateLimitWarning, RequestCounter } from "@/components/chat/RateLimitWarning";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { YouTubeSummary } from "@/components/integrations/YouTubeSummary";
import { GitHubAnalyzer } from "@/components/integrations/GitHubAnalyzer";
import { GoogleCalendar } from "@/components/integrations/GoogleCalendar";
import { generateId, parseFollowUpSuggestions, cn } from "@/lib/utils";
import { Persona, defaultPersona } from "@/lib/personas";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useChatStorage } from "@/hooks/useChatStorage";
import { useAuth } from "@/hooks/useAuth";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useFirestoreStorage } from "@/hooks/useFirestoreStorage";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

// Store images separately (not in useChat messages)
interface MessageImages {
  [messageId: string]: AttachedImage[];
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [selectedPersona, setSelectedPersona] = useState<Persona>(defaultPersona);
  const [showContextPinning, setShowContextPinning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [messageImages, setMessageImages] = useState<MessageImages>({});
  const [pendingImages, setPendingImages] = useState<AttachedImage[]>([]);
  const [rateLimitWarning, setRateLimitWarning] = useState<{ show: boolean; waitTime: number }>({
    show: false,
    waitTime: 0,
  });
  const [selectedModel, setSelectedModel] = useState<ModelSpeed>("cepat");
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth - Local (fallback) and Firebase
  const localAuth = useAuth();
  const firebaseAuth = useFirebaseAuth();

  // Use Firebase if configured, otherwise fall back to local auth
  const isFirebaseConfigured = firebaseAuth.isConfigured;
  const user = isFirebaseConfigured ? firebaseAuth.user : localAuth.user;
  const isAuthenticated = isFirebaseConfigured ? firebaseAuth.isAuthenticated : localAuth.isAuthenticated;
  const authLoading = isFirebaseConfigured ? firebaseAuth.isLoading : localAuth.isLoading;

  // Helper to get user display name
  const getUserDisplayName = (): string => {
    if (!user) return "Kamu";
    // Check for local auth user (has username)
    if ('username' in user && user.username) return user.username;
    // Check for Firebase user (has displayName)
    if ('displayName' in user && user.displayName) return user.displayName;
    return "Kamu";
  };

  // Helper to get user initial
  const getUserInitial = (): string => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Firestore Storage (for Firebase users)
  const firestoreStorage = useFirestoreStorage(firebaseAuth.user?.uid || null);

  // Context Pinning
  const { pinnedContexts, setPinnedContexts, getContextString } = usePinnedContexts();

  // Chat Storage (localStorage persistence)
  const {
    conversations: storedConversations,
    isLoaded: storageLoaded,
    createConversation,
    updateConversation,
    renameConversation,
    deleteConversation,
    getConversation,
  } = useChatStorage();

  // User Plan & Rate Limiting
  const {
    currentPlan,
    isLoaded: planLoaded,
    activatePlan,
    resetToFree,
    checkRateLimit,
    recordRequest,
    getRemainingRequests,
  } = useUserPlan();

  const { messages, append, isLoading, stop, setMessages, reload } = useChat({
    api: "/api/chat",
    body: {
      personaId: selectedPersona.id,
      pinnedContext: getContextString(),
      modelId: MODEL_CONFIG[selectedModel].model,
      useWebSearch,
    },
    onFinish: (message) => {
      // Save to storage when AI finishes responding
      if (activeConversationId) {
        const currentMsgs = [...messages, message];
        updateConversation(activeConversationId, currentMsgs);
      }
    },
  });

  // Convert stored conversations to sidebar format
  const sidebarConversations: Conversation[] = useMemo(() => {
    return storedConversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      updatedAt: new Date(conv.updatedAt),
    }));
  }, [storedConversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create new conversation when first message is sent
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "user" && !activeConversationId) {
      const newId = generateId();
      const title = messages[0].content.slice(0, 50);
      createConversation(newId, title, messages, selectedPersona.id);
      setActiveConversationId(newId);
    }
  }, [messages, activeConversationId, createConversation, selectedPersona.id]);

  // Update storage when messages change (for user messages)
  useEffect(() => {
    if (activeConversationId && messages.length > 0 && !isLoading) {
      updateConversation(activeConversationId, messages);
    }
  }, [messages, activeConversationId, isLoading, updateConversation]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveConversationId(undefined);
  }, [setMessages]);

  const handleSelectConversation = useCallback((id: string) => {
    const conv = getConversation(id);
    if (conv) {
      setMessages(conv.messages);
      setActiveConversationId(id);
    }
  }, [getConversation, setMessages]);

  const handleRenameConversation = useCallback((id: string, newTitle: string) => {
    renameConversation(id, newTitle);
  }, [renameConversation]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (activeConversationId === id) {
      setMessages([]);
      setActiveConversationId(undefined);
    }
  }, [deleteConversation, activeConversationId, setMessages]);

  const handleSendMessage = useCallback((content: string, images?: AttachedImage[], files?: AttachedFile[]) => {
    // Check rate limit before sending
    const rateLimitCheck = checkRateLimit();
    
    if (!rateLimitCheck.allowed) {
      setRateLimitWarning({
        show: true,
        waitTime: rateLimitCheck.waitTime || 60,
      });
      
      // Auto-hide warning after wait time
      setTimeout(() => {
        setRateLimitWarning({ show: false, waitTime: 0 });
      }, (rateLimitCheck.waitTime || 60) * 1000);
      
      return;
    }

    // Record the request
    recordRequest();
    
    // Store images for the pending message if any
    if (images && images.length > 0) {
      setPendingImages(images);
    }
    
    // Build message content for display
    let displayContent = content;
    
    // Add file contents to the message
    if (files && files.length > 0) {
      const fileContents = files
        .filter(f => f.processed && !f.processed.error)
        .map(f => f.processed!.content)
        .join("\n\n");
      
      if (fileContents) {
        displayContent = displayContent 
          ? `${displayContent}\n\n---\n\n${fileContents}`
          : fileContents;
      }
    }
    
    // Build API message content (with base64 images for vision)
    let apiContent: any = displayContent;
    
    if (images && images.length > 0) {
      apiContent = [
        { type: "text", text: content || "Jelaskan gambar ini" },
        ...images.map(img => ({
          type: "image",
          image: img.base64,
        })),
      ];
    }
    
    append({
      role: "user",
      content: apiContent,
    });
  }, [checkRateLimit, recordRequest, append]);

  // Edit message handler
  const handleEditMessage = useCallback((messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Remove all messages after the edited one
    const newMessages = messages.slice(0, messageIndex);
    setMessages(newMessages);

    // Re-send the edited message
    setTimeout(() => {
      handleSendMessage(newContent);
    }, 100);
  }, [messages, setMessages, handleSendMessage]);

  // Regenerate response handler
  const handleRegenerate = useCallback((messageId: string) => {
    // Find the message before this assistant message (should be user message)
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;

    // Get the user message that triggered this response
    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== "user") return;

    // Remove the assistant message
    const newMessages = messages.slice(0, messageIndex);
    setMessages(newMessages);

    // Reload will regenerate from the last user message
    setTimeout(() => {
      reload();
    }, 100);
  }, [messages, setMessages, reload]);

  const hasMessages = messages.length > 0;

  // Parse suggestions from the last assistant message
  const { processedMessages, suggestions } = useMemo(() => {
    if (messages.length === 0) {
      return { processedMessages: [], suggestions: [] };
    }

    const processed = messages.map((msg) => {
      if (msg.role === "assistant" && msg.content) {
        const { cleanContent } = parseFollowUpSuggestions(msg.content as string);
        return { ...msg, content: cleanContent };
      }
      return { ...msg, content: (msg.content as string) || "" };
    });

    // Get suggestions from last assistant message
    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
    const lastSuggestions = lastAssistantMsg
      ? parseFollowUpSuggestions(lastAssistantMsg.content as string).suggestions
      : [];

    return { processedMessages: processed, suggestions: lastSuggestions };
  }, [messages]);

  const handleFollowUpSelect = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // YouTube Summary handler
  const handleYouTubeSummary = (summary: string, videoInfo: any) => {
    const message = `📺 **Video YouTube: ${videoInfo.title}**\n\n${summary}`;
    handleSendMessage(message);
  };

  // GitHub Analysis handler
  const handleGitHubAnalysis = (analysis: string, repoInfo: any) => {
    const message = `🐙 **Repository: ${repoInfo.fullName}**\n\n${analysis}`;
    handleSendMessage(message);
  };

  // Calendar send to chat handler
  const handleCalendarSendToChat = (content: string) => {
    handleSendMessage(content);
    setShowCalendar(false);
  };

  // Unified login handler
  const handleLogin = async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      return firebaseAuth.signInWithEmail(email, password);
    }
    return localAuth.login(email, password);
  };

  // Unified register handler
  const handleRegister = async (username: string, email: string, password: string) => {
    if (isFirebaseConfigured) {
      return firebaseAuth.registerWithEmail(email, password, username);
    }
    return localAuth.register(username, email, password);
  };

  // Unified logout handler
  const handleLogout = () => {
    if (isFirebaseConfigured) {
      firebaseAuth.logout();
    } else {
      localAuth.logout();
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleSignIn={firebaseAuth.signInWithGoogle}
        isGoogleLoading={firebaseAuth.isLoading}
        firebaseConfigured={isFirebaseConfigured}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentPlan={currentPlan}
        onActivate={activatePlan}
        onResetToFree={resetToFree}
        remainingRequests={getRemainingRequests()}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Rate Limit Warning */}
      {rateLimitWarning.show && (
        <RateLimitWarning
          waitTime={rateLimitWarning.waitTime}
          planName={currentPlan.name}
          onUpgrade={() => {
            setRateLimitWarning({ show: false, waitTime: 0 });
            setShowSettings(true);
          }}
        />
      )}

      {/* Prompt Templates Modal */}
      <PromptTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={(prompt) => {
          handleSendMessage(prompt);
          setShowTemplates(false);
        }}
      />

      {/* Context Pinning Modal */}
      <ContextPinning
        isOpen={showContextPinning}
        onClose={() => setShowContextPinning(false)}
        pinnedContexts={pinnedContexts}
        onUpdate={setPinnedContexts}
      />

      {/* YouTube Summary Modal */}
      <YouTubeSummary
        isOpen={showYouTube}
        onClose={() => setShowYouTube(false)}
        onSummaryGenerated={handleYouTubeSummary}
      />

      {/* GitHub Analyzer Modal */}
      <GitHubAnalyzer
        isOpen={showGitHub}
        onClose={() => setShowGitHub(false)}
        onAnalysisGenerated={handleGitHubAnalysis}
      />

      {/* Google Calendar Modal */}
      <GoogleCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSendToChat={handleCalendarSendToChat}
      />

      {/* Sidebar */}
      <Sidebar
        conversations={sidebarConversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userName={getUserDisplayName()}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-2 sm:px-4 border-b border-[var(--border)] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Sidebar Toggle Button - Desktop (when sidebar is closed) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] transition-colors",
                sidebarOpen ? "lg:hidden" : ""
              )}
              title="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-light tracking-tight text-[var(--foreground)] truncate">
              Nezar<span className="font-medium">AI</span>
            </h1>
            {/* Desktop Persona Selector - Hidden on mobile */}
            <div className="hidden sm:block">
              <PersonaSelector
                selectedPersona={selectedPersona}
                onSelect={setSelectedPersona}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Request Counter - Hidden on very small screens */}
            <div className="hidden sm:block">
              <RequestCounter
                remaining={getRemainingRequests()}
                total={currentPlan.requestsPerMinute === -1 ? "unlimited" : currentPlan.requestsPerMinute}
                planBadge={currentPlan.badge}
                badgeColor={currentPlan.badgeColor}
                isVerified={currentPlan.isVerified}
              />
            </div>
            
            {/* Context Pinning Button */}
            <button
              onClick={() => setShowContextPinning(true)}
              className={`p-2 rounded-lg transition-colors ${
                pinnedContexts.length > 0
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"
              }`}
              title={`Context Pinning (${pinnedContexts.length} aktif)`}
            >
              <Pin className="w-4 h-4" />
            </button>
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="hidden sm:block p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] transition-colors"
              title="Setelan & Akun"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {/* User Avatar */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-medium text-sm hover:opacity-90 transition-opacity"
              title="Setelan & Akun"
            >
              {getUserInitial()}
            </button>
          </div>
        </header>

        {/* Mobile Persona Selector - shown only on small screens */}
        <div className="sm:hidden px-3 py-2 border-b border-[var(--border)]">
          <PersonaSelector
            selectedPersona={selectedPersona}
            onSelect={setSelectedPersona}
            compact
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!hasMessages ? (
            // Welcome Screen - Minimalist elegant design
            <div className="flex-1 flex flex-col">
              {/* Centered Content */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
                {/* Minimal greeting */}
                <div className="mb-12 text-center">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-[var(--foreground)]">
                    Halo, ada yang bisa dibantu?
                  </h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Ketik pesan atau pilih opsi di bawah
                  </p>
                </div>
                
                {/* Minimal action grid - monochrome */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md w-full">
                  <button
                    onClick={() => setShowYouTube(true)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface)]/50 transition-all duration-200"
                  >
                    <Youtube className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors" />
                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">YouTube</span>
                  </button>

                  <button
                    onClick={() => setShowGitHub(true)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface)]/50 transition-all duration-200"
                  >
                    <Github className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors" />
                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">GitHub</span>
                  </button>

                  <button
                    onClick={() => setShowCalendar(true)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface)]/50 transition-all duration-200"
                  >
                    <Calendar className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors" />
                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">Calendar</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage("Buatkan gambar untuk saya")}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface)]/50 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">Gambar</span>
                  </button>
                  
                  <button
                    onClick={() => handleSendMessage("Bantu saya menulis kode")}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface)]/50 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">Kode</span>
                  </button>
                  
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface)]/50 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">Lainnya</span>
                  </button>
                </div>
              </div>
              
              {/* Input at Bottom */}
              <div className="px-2 sm:px-4 pb-2 sm:pb-4">
                <div className="max-w-3xl mx-auto">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    onStop={stop}
                    onOpenYouTube={() => setShowYouTube(true)}
                    onOpenGitHub={() => setShowGitHub(true)}
                    onOpenCalendar={() => setShowCalendar(true)}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    useWebSearch={useWebSearch}
                    onWebSearchChange={setUseWebSearch}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Messages List
            <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto pb-4">
              <div className="flex flex-col">
                {processedMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={{
                      id: message.id,
                      role: message.role as "user" | "assistant",
                      content: message.content,
                    }}
                    isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                    onEdit={message.role === "user" ? handleEditMessage : undefined}
                    onRegenerate={message.role === "assistant" ? handleRegenerate : undefined}
                  />
                ))}
                
                {/* Typing Indicator */}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <TypingIndicator />
                )}
              </div>
              
              {/* Follow-up Suggestions */}
              {!isLoading && suggestions.length > 0 && (
                <div className="px-2 sm:px-4">
                  <FollowUpSuggestions
                    suggestions={suggestions}
                    onSelect={handleFollowUpSelect}
                    isLoading={isLoading}
                  />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom when there are messages */}
        {hasMessages && (
          <div className="border-t border-[var(--border)] bg-[var(--background)] py-2 sm:py-4 px-2 sm:px-0">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onStop={stop}
              onOpenYouTube={() => setShowYouTube(true)}
              onOpenGitHub={() => setShowGitHub(true)}
              onOpenCalendar={() => setShowCalendar(true)}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              useWebSearch={useWebSearch}
              onWebSearchChange={setUseWebSearch}
            />
          </div>
        )}
      </main>
    </div>
  );
}
