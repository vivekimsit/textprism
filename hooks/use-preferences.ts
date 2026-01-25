"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "textprism-preferences";

export interface UserPreferences {
  whoIAm: string;
  defaultTone: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  whoIAm: "senior-engineer",
  defaultTone: "direct",
};

export function usePreferences() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when preferences change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch {
        // Ignore storage errors
      }
    }
  }, [preferences, isLoaded]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const setWhoIAm = useCallback(
    (value: string) => {
      updatePreferences({ whoIAm: value });
    },
    [updatePreferences],
  );

  const setDefaultTone = useCallback(
    (value: string) => {
      updatePreferences({ defaultTone: value });
    },
    [updatePreferences],
  );

  return {
    preferences,
    isLoaded,
    setWhoIAm,
    setDefaultTone,
    updatePreferences,
  };
}

// Options for dropdowns
export const WHO_I_AM_OPTIONS = [
  { value: "junior-engineer", label: "Junior Engineer" },
  { value: "senior-engineer", label: "Senior Engineer" },
  { value: "tech-lead", label: "Tech Lead" },
  { value: "engineering-manager", label: "Engineering Manager" },
  { value: "product-manager", label: "Product Manager" },
  { value: "designer", label: "Designer" },
  { value: "founder", label: "Founder" },
  { value: "freelancer", label: "Freelancer" },
];

export const TONE_OPTIONS = [
  { value: "direct", label: "Direct" },
  { value: "warm", label: "Warm" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "persuasive", label: "Persuasive" },
];

// Context-dependent audience options per channel
export const AUDIENCE_BY_CHANNEL: Record<
  string,
  { value: string; label: string }[]
> = {
  slack: [
    { value: "dm", label: "DM" },
    { value: "team", label: "Team" },
    { value: "manager", label: "Manager" },
    { value: "stakeholder", label: "Stakeholder" },
  ],
  email: [
    { value: "manager", label: "Manager" },
    { value: "client", label: "Client" },
    { value: "stakeholder", label: "Stakeholder" },
    { value: "recruiter", label: "Recruiter" },
  ],
  linkedin: [
    { value: "public", label: "Public" },
    { value: "network", label: "Network" },
  ],
  reddit: [{ value: "community", label: "Community" }],
  quora: [{ value: "public", label: "Public" }],
};

// Default audience per channel
export const DEFAULT_AUDIENCE: Record<string, string> = {
  slack: "team",
  email: "manager",
  linkedin: "public",
  reddit: "community",
  quora: "public",
};

export const CHANNEL_OPTIONS = [
  { value: "slack", label: "Slack" },
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "reddit", label: "Reddit" },
  { value: "quora", label: "Quora" },
] as const;
