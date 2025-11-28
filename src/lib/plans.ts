export type PlanType = "noob" | "pro" | "hacker";

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  requestsPerMinute: number; // -1 for unlimited
  badge: string;
  badgeColor: string;
  features: string[];
  requiresActivation: boolean;
  isVerified: boolean; // Centang biru untuk Pro & Hacker
}

export const plans: Record<PlanType, Plan> = {
  noob: {
    id: "noob",
    name: "Noob",
    description: "Plan gratis untuk pemula",
    requestsPerMinute: 5,
    badge: "NOOB",
    badgeColor: "bg-gray-500",
    features: [
      "5 request per menit",
      "Akses dasar ke NezarAI",
      "Riwayat percakapan terbatas",
    ],
    requiresActivation: false,
    isVerified: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Untuk pengguna serius",
    requestsPerMinute: 20,
    badge: "PRO",
    badgeColor: "bg-blue-500",
    features: [
      "20 request per menit",
      "Semua persona tersedia",
      "Riwayat percakapan penuh",
      "Context pinning",
    ],
    requiresActivation: true,
    isVerified: true, // ✓ Centang biru
  },
  hacker: {
    id: "hacker",
    name: "Hacker",
    description: "Unlimited power untuk developer sejati",
    requestsPerMinute: -1, // Unlimited
    badge: "HACKER",
    badgeColor: "bg-gradient-to-r from-green-500 to-emerald-500",
    features: [
      "Unlimited request",
      "Semua fitur Pro",
      "Prioritas response",
      "Early access fitur baru",
    ],
    requiresActivation: true,
    isVerified: true, // ✓ Centang biru
  },
};

export const getPlan = (planId: PlanType): Plan => {
  return plans[planId] || plans.noob;
};

// Activation codes (in real app, this should be in database/backend)
// Format: CODE -> { planId, usedBy, expiresAt }
export const activationCodes: Record<string, { planId: PlanType; maxUses: number; uses: number }> = {
  // Demo codes - in production, generate these dynamically
  "PRO-2024-DEMO": { planId: "pro", maxUses: 100, uses: 0 },
  "HACKER-ELITE-X": { planId: "hacker", maxUses: 10, uses: 0 },
};

export const validateActivationCode = (code: string): { valid: boolean; planId?: PlanType; error?: string } => {
  const normalizedCode = code.trim().toUpperCase();
  const codeData = activationCodes[normalizedCode];
  
  if (!codeData) {
    return { valid: false, error: "Kode aktivasi tidak valid" };
  }
  
  if (codeData.uses >= codeData.maxUses) {
    return { valid: false, error: "Kode aktivasi sudah mencapai batas penggunaan" };
  }
  
  return { valid: true, planId: codeData.planId };
};
