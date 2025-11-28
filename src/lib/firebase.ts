import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// PENTING: Buat project di https://console.firebase.google.com
// 1. Create new project
// 2. Add web app
// 3. Copy config ke .env.local
const firebaseConfig = {
  apiKey: "AIzaSyA-1XX-dYyl-66lMwchaylzMQsGasS1Klg",
  authDomain: "nezarai.firebaseapp.com",
  projectId: "nezarai",
  storageBucket: "nezarai.firebasestorage.app",
  messagingSenderId: "500478043932",
  appId: "1:500478043932:web:c82c537b78b43459fefcd9",
  measurementId: "G-WBVP05F324",
};

// Initialize Firebase (prevent multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth instance
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account", // Always show account picker
});

// Firestore instance
export const db = getFirestore(app);

export default app;
