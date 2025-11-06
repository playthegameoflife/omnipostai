import { useState, useEffect } from 'react';

interface OnboardingProgress {
  hasSeenWelcome: boolean;
  hasConnectedAccount: boolean;
  hasCreatedPost: boolean;
  hasScheduledPost: boolean;
  onboardingComplete: boolean;
}

const ONBOARDING_STORAGE_KEY = 'omnipost_onboarding';

export const useOnboarding = () => {
  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      hasSeenWelcome: false,
      hasConnectedAccount: false,
      hasCreatedPost: false,
      hasScheduledPost: false,
      onboardingComplete: false,
    };
  });

  const isFirstTimeUser = !progress.hasSeenWelcome;

  const updateProgress = (updates: Partial<OnboardingProgress>) => {
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newProgress));
  };

  const markWelcomeSeen = () => {
    updateProgress({ hasSeenWelcome: true });
  };

  const markAccountConnected = () => {
    updateProgress({ hasConnectedAccount: true });
  };

  const markPostCreated = () => {
    updateProgress({ hasCreatedPost: true });
  };

  const markPostScheduled = () => {
    updateProgress({ hasScheduledPost: true });
  };

  const completeOnboarding = () => {
    updateProgress({ onboardingComplete: true });
  };

  const resetOnboarding = () => {
    const defaultProgress = {
      hasSeenWelcome: false,
      hasConnectedAccount: false,
      hasCreatedPost: false,
      hasScheduledPost: false,
      onboardingComplete: false,
    };
    setProgress(defaultProgress);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(defaultProgress));
  };

  useEffect(() => {
    // Check if user has completed all onboarding steps
    if (
      progress.hasSeenWelcome &&
      progress.hasConnectedAccount &&
      progress.hasCreatedPost &&
      !progress.onboardingComplete
    ) {
      completeOnboarding();
    }
  }, [progress.hasSeenWelcome, progress.hasConnectedAccount, progress.hasCreatedPost]);

  return {
    progress,
    isFirstTimeUser,
    updateProgress,
    markWelcomeSeen,
    markAccountConnected,
    markPostCreated,
    markPostScheduled,
    completeOnboarding,
    resetOnboarding,
  };
};

