"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Pin, Settings } from "lucide-react";
import { Sidebar, Conversation } from "@/components/sidebar/Sidebar";
import { ChatInput, AttachedImage, AttachedFile } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { PersonaSelector } from "@/components/chat/PersonaSelector";
import { FollowUpSuggestions } from "@/components/chat/FollowUpSuggestions";
import { ContextPinning, usePinnedContexts } from "@/components/chat/ContextPinning";
import { RateLimitWarning, RequestCounter } from "@/components/chat/RateLimitWarning";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateId, parseFollowUpSuggestions } from "@/lib/utils";
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

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [selectedPersona, setSelectedPersona] = useState<Persona>(defaultPersona);
  const [showContextPinning, setShowContextPinning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messageImages, setMessageImages] = useState<MessageImages>({});
  const [pendingImages, setPendingImages] = useState<AttachedImage[]>([]);
  const [rateLimitWarning, setRateLimitWarning] = useState<{ show: boolean; waitTime: number }>({
    show: false,
    waitTime: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth - Local (fallback) and Firebase
  const localAuth = useAuth();
  const firebaseAuth = useFirebaseAuth();

  // Use Firebase if configured, otherwise fall back to local auth
  const isFirebaseConfigured = firebaseAuth.isConfigured;
  const user = isFirebaseConfigured ? firebaseAuth.user : localAuth.user;
  const isAuthenticated = isFirebaseConfigured ? firebaseAuth.isAuthenticated : localAuth.isAuthenticated;
  const authLoading = isFirebaseConfigured ? firebaseAuth.isLoading : localAuth.isLoading;

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
    
    // Add image indicator
    if (images && images.length > 0) {
      displayContent = `[📷 ${images.length} gambar] ${displayContent}`.trim();
    }
    
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

      {/* Context Pinning Modal */}
      <ContextPinning
        isOpen={showContextPinning}
        onClose={() => setShowContextPinning(false)}
        pinnedContexts={pinnedContexts}
        onUpdate={setPinnedContexts}
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
        userName={user?.username || user?.displayName || "Kamu"}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            {!sidebarOpen && <div className="w-10" />}
            <h1 className="text-lg font-medium text-[var(--foreground)]">NezarAI</h1>
            <PersonaSelector
              selectedPersona={selectedPersona}
              onSelect={setSelectedPersona}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Request Counter */}
            <RequestCounter
              remaining={getRemainingRequests()}
              total={currentPlan.requestsPerMinute === -1 ? "unlimited" : currentPlan.requestsPerMinute}
              planBadge={currentPlan.badge}
              badgeColor={currentPlan.badgeColor}
              isVerified={currentPlan.isVerified}
            />
            
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
              className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] transition-colors"
              title="Setelan & Akun"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {/* User Avatar */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 flex items-center justify-center text-white font-medium text-sm hover:opacity-90 transition-opacity"
              title="Setelan & Akun"
            >
              {user?.username?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || "N"}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            // Welcome Screen
            <div className="h-full flex flex-col items-center justify-center px-4">
              <h2 className="text-4xl md:text-5xl font-medium mb-8">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Halo, {user?.username || user?.displayName || "Kamu"}
                </span>
              </h2>
              <div className="w-full max-w-3xl">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onStop={stop}
                />
              </div>
            </div>
          ) : (
            // Messages List
            <div className="max-w-4xl mx-auto pb-4">
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
              
              {/* Follow-up Suggestions */}
              {!isLoading && suggestions.length > 0 && (
                <div className="px-4 max-w-4xl mx-auto">
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
          <div className="border-t border-[var(--border)] bg-[var(--background)] py-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onStop={stop}
            />
          </div>
        )}
      </main>
    </div>
  );
}
