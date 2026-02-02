"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "textprism-preferences";

export interface UserPreferences {
  whoIAm: string;
  defaultTone: string;
  country: string;
  jobCategory: string;
  companySize: string;
  yearsExperience: string;
  // Channel rules: maps channel name to array of enabled rule IDs
  // If undefined/empty for a channel, use defaults from CHANNEL_RULES
  channelRulesEnabled: Record<string, string[]>;
  // AI generation settings
  openaiApiKey: string;
  selectedModel: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  whoIAm: "senior-engineer",
  defaultTone: "direct",
  country: "",
  jobCategory: "",
  companySize: "",
  yearsExperience: "",
  channelRulesEnabled: {},
  openaiApiKey: "",
  selectedModel: "gpt-4o-mini",
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

  const setCountry = useCallback(
    (value: string) => {
      updatePreferences({ country: value });
    },
    [updatePreferences],
  );

  const setJobCategory = useCallback(
    (value: string) => {
      updatePreferences({ jobCategory: value });
    },
    [updatePreferences],
  );

  const setCompanySize = useCallback(
    (value: string) => {
      updatePreferences({ companySize: value });
    },
    [updatePreferences],
  );

  const setYearsExperience = useCallback(
    (value: string) => {
      updatePreferences({ yearsExperience: value });
    },
    [updatePreferences],
  );

  const setChannelRules = useCallback(
    (channel: string, enabledRuleIds: string[]) => {
      setPreferences((prev) => ({
        ...prev,
        channelRulesEnabled: {
          ...prev.channelRulesEnabled,
          [channel]: enabledRuleIds,
        },
      }));
    },
    [],
  );

  const getChannelRules = useCallback(
    (channel: string): string[] | undefined => {
      return preferences.channelRulesEnabled[channel];
    },
    [preferences.channelRulesEnabled],
  );

  const setOpenaiApiKey = useCallback(
    (value: string) => {
      updatePreferences({ openaiApiKey: value });
    },
    [updatePreferences],
  );

  const setSelectedModel = useCallback(
    (value: string) => {
      updatePreferences({ selectedModel: value });
    },
    [updatePreferences],
  );

  const clearOpenaiApiKey = useCallback(() => {
    updatePreferences({ openaiApiKey: "" });
  }, [updatePreferences]);

  return {
    preferences,
    isLoaded,
    setWhoIAm,
    setDefaultTone,
    setCountry,
    setJobCategory,
    setCompanySize,
    setYearsExperience,
    setChannelRules,
    getChannelRules,
    setOpenaiApiKey,
    setSelectedModel,
    clearOpenaiApiKey,
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

export const COUNTRY_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
  { value: "sg", label: "Singapore" },
  { value: "nl", label: "Netherlands" },
  { value: "se", label: "Sweden" },
  { value: "br", label: "Brazil" },
  { value: "other", label: "Other" },
];

export const JOB_CATEGORY_OPTIONS = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "sales", label: "Sales" },
  { value: "consulting", label: "Consulting" },
  { value: "legal", label: "Legal" },
  { value: "hr", label: "Human Resources" },
  { value: "operations", label: "Operations" },
  { value: "media", label: "Media & Entertainment" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "real-estate", label: "Real Estate" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: "startup", label: "Startup (1-10)" },
  { value: "small", label: "Small (11-50)" },
  { value: "medium", label: "Medium (51-200)" },
  { value: "large", label: "Large (201-1000)" },
  { value: "enterprise", label: "Enterprise (1000+)" },
];

export const YEARS_EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-4", label: "2-4 years" },
  { value: "5-7", label: "5-7 years" },
  { value: "8-10", label: "8-10 years" },
  { value: "10+", label: "10+ years" },
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
