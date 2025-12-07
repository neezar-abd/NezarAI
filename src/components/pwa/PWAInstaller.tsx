"use client";

import { useEffect } from "react";

export function PWAInstaller() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register service worker
    const registerSW = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
      return () => window.removeEventListener("load", registerSW);
    }
  }, []);

  return null;
}
