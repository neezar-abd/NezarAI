"use client";

import { useState, useEffect, useCallback } from "react";
import { Message } from "ai";

export interface StoredConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  personaId?: string;
}

const STORAGE_KEY = "nezarai-conversations";

export function useChatStorage() {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort by updatedAt descending
        const sorted = parsed.sort(
          (a: StoredConversation, b: StoredConversation) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setConversations(sorted);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      } catch (error) {
        console.error("Failed to save conversations:", error);
      }
    }
  }, [conversations, isLoaded]);

  // Create new conversation
  const createConversation = useCallback((
    id: string,
    title: string,
    messages: Message[],
    personaId?: string
  ): StoredConversation => {
    const now = new Date().toISOString();
    const newConversation: StoredConversation = {
      id,
      title: title.slice(0, 100),
      messages,
      createdAt: now,
      updatedAt: now,
      personaId,
    };
    
    setConversations((prev) => [newConversation, ...prev]);
    return newConversation;
  }, []);

  // Update conversation messages
  const updateConversation = useCallback((
    id: string,
    messages: Message[],
    title?: string
  ) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              messages,
              title: title || conv.title,
              updatedAt: new Date().toISOString(),
            }
          : conv
      ).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
  }, []);

  // Rename conversation
  const renameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? { ...conv, title: newTitle.slice(0, 100), updatedAt: new Date().toISOString() }
          : conv
      )
    );
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  }, []);

  // Get conversation by ID
  const getConversation = useCallback(
    (id: string): StoredConversation | undefined => {
      return conversations.find((conv) => conv.id === id);
    },
    [conversations]
  );

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Export conversations as JSON
  const exportConversations = useCallback(() => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileName = `nezarai-chats-${new Date().toISOString().split("T")[0]}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
  }, [conversations]);

  // Import conversations from JSON
  const importConversations = useCallback((jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData) as StoredConversation[];
      if (Array.isArray(imported)) {
        setConversations((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newConvs = imported.filter((c) => !existingIds.has(c.id));
          return [...newConvs, ...prev].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
        return { success: true, count: imported.length };
      }
      return { success: false, error: "Invalid format" };
    } catch {
      return { success: false, error: "Failed to parse JSON" };
    }
  }, []);

  return {
    conversations,
    isLoaded,
    createConversation,
    updateConversation,
    renameConversation,
    deleteConversation,
    getConversation,
    clearAllConversations,
    exportConversations,
    importConversations,
  };
}
