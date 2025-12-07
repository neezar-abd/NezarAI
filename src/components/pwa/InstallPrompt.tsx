"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if dismissed before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, show instructions after delay if not standalone
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="install-banner flex items-center gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
        <Smartphone className="w-6 h-6 text-white/80" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Install NezarAI
        </h3>
        {isIOS ? (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Tap <span className="inline-flex items-center mx-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L8 6h3v8h2V6h3L12 2zm-7 8v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10h-2v10H7V10H5z"/>
              </svg>
            </span> lalu &quot;Add to Home Screen&quot;
          </p>
        ) : (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Akses cepat dari home screen
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--accent)] text-[var(--background)] rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
        >
          <X className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>
    </div>
  );
}
