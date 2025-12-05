"use client";

import { useState } from "react";
import {
  X,
  User,
  Crown,
  Zap,
  Check,
  Key,
  AlertCircle,
  Sparkles,
  BadgeCheck,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Plan, PlanType, plans } from "@/lib/plans";
import { User as LocalUser } from "@/hooks/useAuth";
import { UserProfile as FirebaseUser } from "@/hooks/useFirebaseAuth";

// Unified user type
type UnifiedUser = LocalUser | FirebaseUser;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan;
  onActivate: (code: string) => { success: boolean; error?: string };
  onResetToFree: () => void;
  userName?: string;
  remainingRequests: number | "unlimited";
  // Auth props
  user?: UnifiedUser | null;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentPlan,
  onActivate,
  onResetToFree,
  userName = "Neezar",
  remainingRequests,
  user,
  isAuthenticated,
  onLogout,
  onOpenAuth,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"account" | "plans">("account");
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  if (!isOpen) return null;

  // Helper to get display name from different user types
  const getDisplayName = (): string => {
    if (!user) return userName;
    if ('username' in user && user.username) return user.username;
    if ('displayName' in user && user.displayName) return user.displayName;
    return userName;
  };

  const displayName = getDisplayName();

  const handleActivate = () => {
    setActivationError(null);
    setActivationSuccess(false);
    
    if (!activationCode.trim()) {
      setActivationError("Masukkan kode aktivasi");
      return;
    }

    const result = onActivate(activationCode);
    
    if (result.success) {
      setActivationSuccess(true);
      setActivationCode("");
      setTimeout(() => setActivationSuccess(false), 3000);
    } else {
      setActivationError(result.error || "Gagal mengaktifkan kode");
    }
  };

  const getPlanIcon = (planId: PlanType) => {
    switch (planId) {
      case "noob":
        return <User className="w-5 h-5" />;
      case "pro":
        return <Crown className="w-5 h-5" />;
      case "hacker":
        return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanBorderColor = (planId: PlanType, isActive: boolean) => {
    if (!isActive) return "border-[var(--border)]";
    switch (planId) {
      case "noob":
        return "border-gray-500";
      case "pro":
        return "border-blue-500";
      case "hacker":
        return "border-green-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-[var(--background-secondary)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Setelan & Akun
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab("account")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "account"
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
          >
            Akun
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "plans"
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
          >
            Plans
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "account" ? (
            <div className="space-y-6">
              {/* Login/Register Prompt for Guest */}
              {!isAuthenticated && onOpenAuth && (
                <div className="p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <LogIn className="w-5 h-5 text-[var(--accent)]" />
                    <span className="font-medium text-[var(--foreground)]">
                      Masuk untuk menyimpan data
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mb-3">
                    Login atau daftar untuk menyimpan chat history dan pengaturan Anda.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
                  >
                    Masuk / Daftar
                  </button>
                </div>
              )}

              {/* User Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/90 font-bold text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[var(--foreground)]">
                    {displayName}
                  </h3>
                  {user?.email && (
                    <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded text-white flex items-center gap-1",
                        currentPlan.badgeColor
                      )}
                    >
                      {currentPlan.badge}
                      {currentPlan.isVerified && <BadgeCheck className="w-3 h-3" />}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {currentPlan.name}
                    </span>
                  </div>
                </div>
                {isAuthenticated && onLogout && (
                  <button
                    onClick={() => {
                      if (confirm("Yakin ingin keluar?")) {
                        onLogout();
                        onClose();
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Keluar</span>
                  </button>
                )}
              </div>

              {/* Current Plan Status */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Plan saat ini
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {currentPlan.name}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Batas request/menit
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {currentPlan.requestsPerMinute === -1
                      ? "Unlimited"
                      : currentPlan.requestsPerMinute}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Request tersisa
                  </span>
                  <span className="text-sm font-medium text-[var(--accent)]">
                    {remainingRequests === "unlimited"
                      ? "∞"
                      : remainingRequests}
                  </span>
                </div>
              </div>

              {/* Activation Code Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Kode Aktivasi
                </label>
                <p className="text-xs text-[var(--text-muted)]">
                  Hubungi admin untuk mendapatkan kode aktivasi Pro atau Hacker
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={activationCode}
                      onChange={(e) => {
                        setActivationCode(e.target.value.toUpperCase());
                        setActivationError(null);
                      }}
                      placeholder="Masukkan kode aktivasi"
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm font-mono"
                    />
                  </div>
                  <button
                    onClick={handleActivate}
                    className="px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    Aktivasi
                  </button>
                </div>
                
                {activationError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {activationError}
                  </div>
                )}
                
                {activationSuccess && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <Check className="w-4 h-4" />
                    Kode berhasil diaktifkan! Plan Anda telah di-upgrade.
                  </div>
                )}
              </div>

              {/* Reset to Free */}
              {currentPlan.id !== "noob" && (
                <div className="pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => {
                      if (confirm("Yakin ingin kembali ke plan Noob (gratis)?")) {
                        onResetToFree();
                      }
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Reset ke plan gratis
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Plans Tab */
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Pilih plan yang sesuai dengan kebutuhanmu. Pro dan Hacker memerlukan kode aktivasi dari admin.
              </p>
              
              {Object.values(plans).map((plan) => {
                const isActive = currentPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      getPlanBorderColor(plan.id, isActive),
                      isActive && "bg-[var(--surface)]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white",
                            plan.badgeColor
                          )}
                        >
                          {getPlanIcon(plan.id)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                            {plan.name}
                            {plan.isVerified && (
                              <BadgeCheck className="w-4 h-4 text-blue-500" />
                            )}
                            {isActive && (
                              <span className="text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded">
                                Aktif
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)]">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[var(--foreground)]">
                          {plan.requestsPerMinute === -1
                            ? "Unlimited"
                            : `${plan.requestsPerMinute} req/min`}
                        </span>
                        {!plan.requiresActivation && (
                          <p className="text-xs text-green-500">Gratis</p>
                        )}
                        {plan.requiresActivation && (
                          <p className="text-xs text-[var(--text-muted)]">
                            Perlu kode aktivasi
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <ul className="space-y-1.5">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                        >
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Admin Contact */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  <span className="font-medium text-[var(--foreground)]">
                    Upgrade ke Pro atau Hacker
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  Hubungi admin untuk mendapatkan kode aktivasi:
                </p>
                <p className="text-sm text-[var(--accent)] mt-1">
                  📧 neezar.tech@gmail.com | 📸 @neezar_abd
                </p>
              </div>

              {/* Attribution */}
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] text-center">
                  <span className="font-normal">nezar</span><span className="font-bold">ai</span>
                  <span className="ml-1">v1.0 • Dibuat oleh Neezar</span>
                </p>
                <p className="text-xs text-[var(--text-muted)] text-center mt-1">
                  Didukung oleh Google Generative AI
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
