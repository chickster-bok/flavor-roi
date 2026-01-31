'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TRIAL_DURATION_DAYS = 7;
const TRIAL_START_KEY = 'flavor-roi-trial-start';

export interface TrialStatus {
  isTrialActive: boolean;
  isPremium: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
  hasTrialExpired: boolean;
}

export function useTrial(): TrialStatus {
  const { user, subscription } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isTrialActive: false,
    isPremium: false,
    daysRemaining: 0,
    trialEndDate: null,
    hasTrialExpired: false,
  });

  useEffect(() => {
    if (!user) {
      setTrialStatus({
        isTrialActive: false,
        isPremium: false,
        daysRemaining: 0,
        trialEndDate: null,
        hasTrialExpired: false,
      });
      return;
    }

    // Check if user has active subscription
    if (subscription?.status === 'active') {
      setTrialStatus({
        isTrialActive: false,
        isPremium: true,
        daysRemaining: 0,
        trialEndDate: null,
        hasTrialExpired: false,
      });
      return;
    }

    // Get or set trial start date
    let trialStart = localStorage.getItem(TRIAL_START_KEY);

    if (!trialStart) {
      // Start trial for new user
      trialStart = new Date().toISOString();
      localStorage.setItem(TRIAL_START_KEY, trialStart);
    }

    const startDate = new Date(trialStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);

    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isTrialActive = now < endDate;
    const hasTrialExpired = now >= endDate;

    setTrialStatus({
      isTrialActive,
      isPremium: isTrialActive, // During trial, treat as premium
      daysRemaining,
      trialEndDate: endDate,
      hasTrialExpired,
    });
  }, [user, subscription]);

  return trialStatus;
}

// Helper to check if a feature is available
export function useFeatureAccess() {
  const { isPremium, isTrialActive, hasTrialExpired, daysRemaining } = useTrial();

  return {
    canUseUnlimitedScans: isPremium || isTrialActive,
    canSaveUnlimitedRecipes: isPremium || isTrialActive,
    canUseMealPlanning: isPremium || isTrialActive,
    canUseAdvancedFilters: isPremium || isTrialActive,
    shouldShowUpgrade: hasTrialExpired,
    isPremium,
    isTrialActive,
    daysRemaining,
  };
}
