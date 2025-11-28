"use client";

import { useState, useEffect, useCallback } from "react";
import { PlanType, getPlan, Plan, validateActivationCode, activationCodes } from "@/lib/plans";

interface UserPlanState {
  planId: PlanType;
  activatedAt?: string;
  activationCode?: string;
}

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  resetTime?: number;
}

const STORAGE_KEY = "nezarai-user-plan";
const RATE_LIMIT_KEY = "nezarai-rate-limit";

export function useUserPlan() {
  const [userPlan, setUserPlan] = useState<UserPlanState>({ planId: "noob" });
  const [rateLimit, setRateLimit] = useState<RateLimitState>({ requests: [], blocked: false });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserPlan(parsed);
      } catch {
        // Invalid stored data, use default
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when plan changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userPlan));
    }
  }, [userPlan, isLoaded]);

  // Get current plan details
  const currentPlan: Plan = getPlan(userPlan.planId);

  // Activate a plan with code
  const activatePlan = useCallback((code: string): { success: boolean; error?: string } => {
    const validation = validateActivationCode(code);
    
    if (!validation.valid || !validation.planId) {
      return { success: false, error: validation.error };
    }

    // Mark code as used (in real app, this would be backend)
    const normalizedCode = code.trim().toUpperCase();
    if (activationCodes[normalizedCode]) {
      activationCodes[normalizedCode].uses++;
    }

    setUserPlan({
      planId: validation.planId,
      activatedAt: new Date().toISOString(),
      activationCode: normalizedCode,
    });

    return { success: true };
  }, []);

  // Downgrade to free plan
  const resetToFree = useCallback(() => {
    setUserPlan({ planId: "noob" });
    setRateLimit({ requests: [], blocked: false });
  }, []);

  // Check if can make request (rate limiting)
  const checkRateLimit = useCallback((): { allowed: boolean; waitTime?: number; remaining?: number } => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old requests
    const recentRequests = rateLimit.requests.filter(time => time > oneMinuteAgo);
    
    const limit = currentPlan.requestsPerMinute;
    
    // Unlimited plan
    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    const remaining = limit - recentRequests.length;
    
    if (recentRequests.length >= limit) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = Math.ceil((oldestRequest + 60000 - now) / 1000);
      return { allowed: false, waitTime, remaining: 0 };
    }

    return { allowed: true, remaining };
  }, [rateLimit.requests, currentPlan.requestsPerMinute]);

  // Record a request
  const recordRequest = useCallback(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    setRateLimit(prev => ({
      ...prev,
      requests: [...prev.requests.filter(time => time > oneMinuteAgo), now],
    }));
  }, []);

  // Get remaining requests
  const getRemainingRequests = useCallback((): number | "unlimited" => {
    if (currentPlan.requestsPerMinute === -1) {
      return "unlimited";
    }
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = rateLimit.requests.filter(time => time > oneMinuteAgo);
    
    return Math.max(0, currentPlan.requestsPerMinute - recentRequests.length);
  }, [currentPlan.requestsPerMinute, rateLimit.requests]);

  return {
    userPlan,
    currentPlan,
    isLoaded,
    activatePlan,
    resetToFree,
    checkRateLimit,
    recordRequest,
    getRemainingRequests,
  };
}
