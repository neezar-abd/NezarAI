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
  // Model access control
  allowedModels: ("cepat" | "seimbang" | "akurat")[];
  maxFileUploads: number; // -1 for unlimited
  maxContextPins: number; // 0 = disabled, -1 = unlimited
  priorityResponse: boolean;
}

export const plans: Record<PlanType, Plan> = {
  noob: {
    id: "noob",
    name: "Noob",
    description: "Gratis selamanya, cocok untuk coba-coba",
    requestsPerMinute: 10,
    badge: "NOOB",
    badgeColor: "bg-zinc-600",
    features: [
      "10 request per menit",
      "Model Cepat (Flash Lite)",
      "Upload 1 file per chat",
      "Riwayat 7 hari terakhir",
      "Akses YouTube & GitHub analyzer",
    ],
    requiresActivation: false,
    isVerified: false,
    allowedModels: ["cepat"],
    maxFileUploads: 1,
    maxContextPins: 0,
    priorityResponse: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Power user dengan akses model premium",
    requestsPerMinute: 30,
    badge: "PRO",
    badgeColor: "bg-blue-600",
    features: [
      "30 request per menit",
      "Model Cepat + Seimbang",
      "Upload hingga 5 file per chat",
      "Context pinning (3 slot)",
      "Riwayat tanpa batas",
      "Semua persona tersedia",
    ],
    requiresActivation: true,
    isVerified: true,
    allowedModels: ["cepat", "seimbang"],
    maxFileUploads: 5,
    maxContextPins: 3,
    priorityResponse: false,
  },
  hacker: {
    id: "hacker",
    name: "Hacker",
    description: "Unlimited everything untuk developer sejati",
    requestsPerMinute: -1, // Unlimited
    badge: "HACKER",
    badgeColor: "bg-gradient-to-r from-emerald-500 to-green-400",
    features: [
      "Unlimited request 🔥",
      "Semua model termasuk Akurat (Pro)",
      "Upload file tanpa batas",
      "Context pinning tanpa batas",
      "Prioritas response lebih cepat",
      "Early access fitur eksperimental",
      "Custom system prompt",
    ],
    requiresActivation: true,
    isVerified: true,
    allowedModels: ["cepat", "seimbang", "akurat"],
    maxFileUploads: -1,
    maxContextPins: -1,
    priorityResponse: true,
  },
};

export const getPlan = (planId: PlanType): Plan => {
  return plans[planId] || plans.noob;
};

// Helper functions
export const canUseModel = (plan: Plan, model: "cepat" | "seimbang" | "akurat"): boolean => {
  return plan.allowedModels.includes(model);
};

export const canUploadFiles = (plan: Plan, currentCount: number): boolean => {
  if (plan.maxFileUploads === -1) return true;
  return currentCount < plan.maxFileUploads;
};

export const canPinContext = (plan: Plan, currentPins: number): boolean => {
  if (plan.maxContextPins === -1) return true;
  if (plan.maxContextPins === 0) return false;
  return currentPins < plan.maxContextPins;
};

// Activation codes (in real app, this should be in database/backend)
// Format: CODE -> { planId, usedBy, expiresAt }
export const activationCodes: Record<string, { planId: PlanType; maxUses: number; uses: number }> = {
  // Demo codes - in production, generate these dynamically
  "PRO-NEZARAI-2024": { planId: "pro", maxUses: 100, uses: 0 },
  "HACKER-MODE-ON": { planId: "hacker", maxUses: 20, uses: 0 },
  // Secret codes
  "EARLY-BIRD-PRO": { planId: "pro", maxUses: 50, uses: 0 },
  "NEZAR-VIP-ACCESS": { planId: "hacker", maxUses: 5, uses: 0 },
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
