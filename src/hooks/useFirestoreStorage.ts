"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: { type: string; name: string; data: string }[];
  isEdited?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  persona?: string;
}

interface FirestoreStorageState {
  conversations: Conversation[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return true; // Firebase is configured with hardcoded values
};

export function useFirestoreStorage(userId: string | null) {
  const [state, setState] = useState<FirestoreStorageState>({
    conversations: [],
    isLoading: true,
    isSyncing: false,
    error: null,
  });

  // Get user's conversations collection path
  const getConversationsPath = useCallback(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "conversations");
  }, [userId]);

  // Load all conversations from Firestore
  const loadConversations = useCallback(async () => {
    if (!userId || !isFirebaseConfigured()) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const conversationsRef = getConversationsPath();
      if (!conversationsRef) return;

      const q = query(conversationsRef, orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);

      const conversations: Conversation[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Chat Baru",
          messages: data.messages || [],
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toMillis()
              : data.createdAt || Date.now(),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toMillis()
              : data.updatedAt || Date.now(),
          pinned: data.pinned || false,
          persona: data.persona,
        };
      });

      setState({
        conversations,
        isLoading: false,
        isSyncing: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Gagal memuat percakapan",
      }));
    }
  }, [userId, getConversationsPath]);

  // Load conversations when userId changes
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Save a conversation to Firestore
  const saveConversation = useCallback(
    async (conversation: Conversation) => {
      if (!userId || !isFirebaseConfigured()) return;

      setState((prev) => ({ ...prev, isSyncing: true }));

      try {
        const conversationsRef = getConversationsPath();
        if (!conversationsRef) return;

        const docRef = doc(conversationsRef, conversation.id);
        await setDoc(docRef, {
          title: conversation.title,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
          updatedAt: serverTimestamp(),
          pinned: conversation.pinned || false,
          persona: conversation.persona || null,
        });

        // Update local state
        setState((prev) => {
          const existingIndex = prev.conversations.findIndex(
            (c) => c.id === conversation.id
          );
          let newConversations: Conversation[];

          if (existingIndex >= 0) {
            newConversations = [...prev.conversations];
            newConversations[existingIndex] = {
              ...conversation,
              updatedAt: Date.now(),
            };
          } else {
            newConversations = [
              { ...conversation, updatedAt: Date.now() },
              ...prev.conversations,
            ];
          }

          return { ...prev, conversations: newConversations, isSyncing: false };
        });
      } catch (error: any) {
        console.error("Error saving conversation:", error);
        setState((prev) => ({ ...prev, isSyncing: false }));
      }
    },
    [userId, getConversationsPath]
  );

  // Delete a conversation from Firestore
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!userId || !isFirebaseConfigured()) return;

      try {
        const conversationsRef = getConversationsPath();
        if (!conversationsRef) return;

        await deleteDoc(doc(conversationsRef, conversationId));

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.filter((c) => c.id !== conversationId),
        }));
      } catch (error: any) {
        console.error("Error deleting conversation:", error);
      }
    },
    [userId, getConversationsPath]
  );

  // Update conversation title
  const updateConversationTitle = useCallback(
    async (conversationId: string, title: string) => {
      if (!userId || !isFirebaseConfigured()) return;

      try {
        const conversationsRef = getConversationsPath();
        if (!conversationsRef) return;

        await updateDoc(doc(conversationsRef, conversationId), {
          title,
          updatedAt: serverTimestamp(),
        });

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === conversationId ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }));
      } catch (error: any) {
        console.error("Error updating title:", error);
      }
    },
    [userId, getConversationsPath]
  );

  // Toggle pin status
  const togglePinConversation = useCallback(
    async (conversationId: string) => {
      if (!userId || !isFirebaseConfigured()) return;

      try {
        const conversationsRef = getConversationsPath();
        if (!conversationsRef) return;

        const conversation = state.conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        const newPinned = !conversation.pinned;
        await updateDoc(doc(conversationsRef, conversationId), {
          pinned: newPinned,
          updatedAt: serverTimestamp(),
        });

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, pinned: newPinned, updatedAt: Date.now() }
              : c
          ),
        }));
      } catch (error: any) {
        console.error("Error toggling pin:", error);
      }
    },
    [userId, getConversationsPath, state.conversations]
  );

  // Clear all conversations
  const clearAllConversations = useCallback(async () => {
    if (!userId || !isFirebaseConfigured()) return;

    try {
      const conversationsRef = getConversationsPath();
      if (!conversationsRef) return;

      // Delete all documents in the collection
      const snapshot = await getDocs(conversationsRef);
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setState((prev) => ({ ...prev, conversations: [] }));
    } catch (error: any) {
      console.error("Error clearing conversations:", error);
    }
  }, [userId, getConversationsPath]);

  // Sync local storage to Firestore (for migration)
  const syncFromLocalStorage = useCallback(async () => {
    if (!userId || !isFirebaseConfigured()) return;

    try {
      const localData = localStorage.getItem("nezar-ai-conversations");
      if (!localData) return;

      const localConversations = JSON.parse(localData) as Conversation[];
      if (localConversations.length === 0) return;

      setState((prev) => ({ ...prev, isSyncing: true }));

      // Save each local conversation to Firestore
      for (const conversation of localConversations) {
        await saveConversation(conversation);
      }

      // Optionally clear local storage after sync
      // localStorage.removeItem("nezar-ai-conversations");

      setState((prev) => ({ ...prev, isSyncing: false }));
    } catch (error) {
      console.error("Error syncing from localStorage:", error);
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [userId, saveConversation]);

  // Get single conversation
  const getConversation = useCallback(
    (conversationId: string): Conversation | undefined => {
      return state.conversations.find((c) => c.id === conversationId);
    },
    [state.conversations]
  );

  return {
    ...state,
    isConfigured: isFirebaseConfigured(),
    loadConversations,
    saveConversation,
    deleteConversation,
    updateConversationTitle,
    togglePinConversation,
    clearAllConversations,
    syncFromLocalStorage,
    getConversation,
  };
}
