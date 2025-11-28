"use client";

import { AlertTriangle, Clock, BadgeCheck } from "lucide-react";

interface RateLimitWarningProps {
  waitTime: number;
  planName: string;
  onUpgrade: () => void;
}

export function RateLimitWarning({ waitTime, planName, onUpgrade }: RateLimitWarningProps) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-sm">Batas request tercapai!</p>
        <p className="text-xs opacity-90">
          Plan {planName} - Tunggu {waitTime} detik atau{" "}
          <button onClick={onUpgrade} className="underline font-medium">
            upgrade plan
          </button>
        </p>
      </div>
      <div className="flex items-center gap-1 text-sm font-mono">
        <Clock className="w-4 h-4" />
        {waitTime}s
      </div>
    </div>
  );
}

interface RequestCounterProps {
  remaining: number | "unlimited";
  total: number | "unlimited";
  planBadge: string;
  badgeColor: string;
  isVerified?: boolean;
}

export function RequestCounter({ remaining, total, planBadge, badgeColor, isVerified }: RequestCounterProps) {
  const isUnlimited = remaining === "unlimited" || total === "unlimited";
  const percentage = isUnlimited ? 100 : Math.max(0, (remaining as number / (total as number)) * 100);
  
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded text-white flex items-center gap-1 ${badgeColor}`}
      >
        {planBadge}
        {isVerified && <BadgeCheck className="w-3 h-3" />}
      </span>
      {!isUnlimited && (
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentage > 50
                  ? "bg-green-500"
                  : percentage > 20
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-[var(--text-muted)] tabular-nums">
            {remaining}/{total}
          </span>
        </div>
      )}
      {isUnlimited && (
        <span className="text-xs text-[var(--text-muted)]">∞</span>
      )}
    </div>
  );
}
