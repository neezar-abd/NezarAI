"use client";

import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AUTH_STORAGE_KEY = "nezarai-auth";
const USERS_STORAGE_KEY = "nezarai-users";

// Simple hash function for password (NOT SECURE - for demo only)
// In production, use bcrypt on server-side
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
}

export function useAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Get all registered users
  const getUsers = useCallback((): StoredUser[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }, []);

  // Save users to storage
  const saveUsers = useCallback((users: StoredUser[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, []);

  // Register new user
  const register = useCallback(async (
    username: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Validate inputs
    if (!username || username.length < 3) {
      return { success: false, error: "Username minimal 3 karakter" };
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "Email tidak valid" };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter" };
    }

    const users = getUsers();
    
    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: "Username sudah digunakan" };
    }

    // Create new user
    const newUser: StoredUser = {
      id: generateId(),
      username,
      email: email.toLowerCase(),
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    };

    // Save to users list
    saveUsers([...users, newUser]);

    // Auto login after register
    const userPublic: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userPublic));
    setState({
      user: userPublic,
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true };
  }, [getUsers, saveUsers]);

  // Login user
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return { success: false, error: "Email tidak terdaftar" };
    }

    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: "Password salah" };
    }

    // Login success
    const userPublic: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userPublic));
    setState({
      user: userPublic,
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true };
  }, [getUsers]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Update profile
  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...updates };
    
    // Update in auth storage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    
    // Update in users list
    const users = getUsers();
    const updatedUsers = users.map((u) =>
      u.id === state.user!.id
        ? { ...u, ...updates }
        : u
    );
    saveUsers(updatedUsers);

    setState((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  }, [state.user, getUsers, saveUsers]);

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };
}
