"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Custom fields from Firestore
  plan?: string;
  activationCode?: string;
  createdAt?: Date;
}

interface FirebaseAuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return true; // Firebase is configured with hardcoded values
};

export function useFirebaseAuth() {
  const [state, setState] = useState<FirebaseAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Convert Firebase User to UserProfile
  const userToProfile = useCallback(async (user: User): Promise<UserProfile> => {
    // Get additional data from Firestore
    let additionalData = {};
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        additionalData = userDoc.data();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      ...additionalData,
    };
  }, []);

  // Create/update user document in Firestore
  const createUserDocument = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // New user - create document
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          plan: "noob",
          createdAt: serverTimestamp(),
        });
      } else {
        // Existing user - update last login
        await setDoc(
          userRef,
          {
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await userToProfile(user);
        setState({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, [userToProfile]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!isFirebaseConfigured()) {
      return { success: false, error: "Firebase belum dikonfigurasi" };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
      return { success: true };
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [createUserDocument]);

  // Sign in with email/password
  const signInWithEmail = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isFirebaseConfigured()) {
        return { success: false, error: "Firebase belum dikonfigurasi" };
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (error: any) {
        const errorMessage = getErrorMessage(error.code);
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Register with email/password
  const registerWithEmail = useCallback(
    async (
      email: string,
      password: string,
      displayName: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isFirebaseConfigured()) {
        return { success: false, error: "Firebase belum dikonfigurasi" };
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(result.user, { displayName });

        // Create Firestore document
        await createUserDocument(result.user);

        return { success: true };
      } catch (error: any) {
        const errorMessage = getErrorMessage(error.code);
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [createUserDocument]
  );

  // Sign out
  const logout = useCallback(async () => {
    if (!isFirebaseConfigured()) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  // Update user profile in Firestore
  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!state.user?.uid) return;

      try {
        await setDoc(doc(db, "users", state.user.uid), updates, { merge: true });
        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...updates } : null,
        }));
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    },
    [state.user?.uid]
  );

  return {
    ...state,
    isConfigured: isFirebaseConfigured(),
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
    updateUserProfile,
  };
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Email tidak valid";
    case "auth/user-disabled":
      return "Akun dinonaktifkan";
    case "auth/user-not-found":
      return "Email tidak terdaftar";
    case "auth/wrong-password":
      return "Password salah";
    case "auth/email-already-in-use":
      return "Email sudah digunakan";
    case "auth/weak-password":
      return "Password terlalu lemah (min 6 karakter)";
    case "auth/popup-closed-by-user":
      return "Login dibatalkan";
    case "auth/network-request-failed":
      return "Koneksi internet bermasalah";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti";
    case "auth/invalid-credential":
      return "Email atau password salah";
    default:
      return "Terjadi kesalahan. Silakan coba lagi";
  }
}
