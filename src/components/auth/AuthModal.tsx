"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleSignIn?: () => Promise<{ success: boolean; error?: string }>;
  isGoogleLoading?: boolean;
  firebaseConfigured?: boolean;
}

type AuthMode = "login" | "register";

export function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister,
  onGoogleSignIn,
  isGoogleLoading = false,
  firebaseConfigured = false 
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Password tidak cocok");
          setIsLoading(false);
          return;
        }
        const result = await onRegister(username, email, password);
        if (!result.success) {
          setError(result.error || "Gagal mendaftar");
        } else {
          onClose();
        }
      } else {
        const result = await onLogin(email, password);
        if (!result.success) {
          setError(result.error || "Gagal login");
        } else {
          onClose();
        }
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {mode === "login" ? "Masuk" : "Daftar"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Google Sign-In */}
        {firebaseConfigured && onGoogleSignIn && (
          <div className="p-6 pb-0 space-y-4">
            <button
              type="button"
              onClick={async () => {
                const result = await onGoogleSignIn();
                if (result.success) {
                  onClose();
                } else if (result.error) {
                  setError(result.error);
                }
              }}
              disabled={isGoogleLoading}
              className={cn(
                "w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-3",
                "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
                "dark:bg-[#1f1f1f] dark:text-white dark:border-[#333] dark:hover:bg-[#2a2a2a]",
                isGoogleLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              Lanjutkan dengan Google
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-sm text-[var(--text-muted)]">atau</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={cn("p-6 space-y-4", firebaseConfigured && "pt-0")}>
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Username (Register only) */}
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-secondary)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-secondary)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--surface-hover)]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                  <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-3 rounded-xl font-medium transition-all",
              "bg-[var(--accent)] text-white hover:opacity-90",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === "login" ? "Masuk..." : "Mendaftar..."}
              </span>
            ) : (
              mode === "login" ? "Masuk" : "Daftar"
            )}
          </button>

          {/* Switch Mode */}
          <p className="text-center text-sm text-[var(--text-secondary)]">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-[var(--accent)] hover:underline"
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[var(--accent)] hover:underline"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-[var(--text-muted)]">
            Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
          </p>
        </div>
      </div>
    </div>
  );
}
