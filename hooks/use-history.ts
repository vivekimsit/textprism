"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_INTENT } from "@/lib/intent";
import { hashString } from "@/lib/utils";

const STORAGE_KEY = "textprism-history-v2";
const LEGACY_STORAGE_KEY = "textprism-history";
const MAX_RECENT_ITEMS = 50;

export interface PromptContext {
  channel: string;
  audience: string;
  tone: string;
  role: string;
}

export interface DraftItem {
  id: string;
  contentHash: string;
  originalText: string;
  context: PromptContext;
  metaPrompt: string;
  updatedAt: number;
}

export interface RecentItem {
  id: string;
  contentHash: string;
  originalText: string;
  context: PromptContext;
  metaPrompt: string;
  lastUsedAt: number;
  usedCount: number;
}

interface StoredHistory {
  version: 2;
  recents: RecentItem[];
  drafts: DraftItem[];
}

function buildContentHash(context: PromptContext, originalText: string) {
  const payload = [
    context.channel,
    context.audience,
    context.tone,
    context.role,
    originalText.trim(),
  ].join("|");
  return hashString(payload);
}

function ensureContextDefaults(context: PromptContext): PromptContext {
  return {
    channel: context.channel,
    audience: context.audience || DEFAULT_INTENT.audience || "team",
    tone: context.tone,
    role: context.role || DEFAULT_INTENT.persona,
  };
}

export function useHistory() {
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.version === 2) {
          if (Array.isArray(parsed.recents)) {
            setRecents(parsed.recents);
          }
          if (Array.isArray(parsed.drafts)) {
            setDrafts(parsed.drafts);
          }
          setIsLoaded(true);
          return;
        }
      }

      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          const migratedRecents: RecentItem[] = parsedLegacy
            .map((item) => {
              const originalText = item.input || item.inputPreview || "";
              const context: PromptContext = ensureContextDefaults({
                channel: item.channel || DEFAULT_INTENT.channel,
                audience: item.audience || DEFAULT_INTENT.audience || "team",
                tone: item.tone || DEFAULT_INTENT.tone,
                role: DEFAULT_INTENT.persona,
              });
              return {
                id: item.id || crypto.randomUUID(),
                contentHash: buildContentHash(context, originalText),
                originalText,
                context,
                metaPrompt: item.prompt || "",
                lastUsedAt: item.timestamp || Date.now(),
                usedCount: 1,
              };
            })
            .slice(0, MAX_RECENT_ITEMS);
          setRecents(migratedRecents);
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (isLoaded) {
      try {
        const payload: StoredHistory = {
          version: 2,
          recents,
          drafts,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage errors
      }
    }
  }, [recents, drafts, isLoaded]);

  const saveDraft = useCallback(
    (draft: Omit<DraftItem, "id" | "contentHash" | "updatedAt">) => {
      const normalizedContext = ensureContextDefaults(draft.context);
      const contentHash = buildContentHash(
        normalizedContext,
        draft.originalText,
      );
      const now = Date.now();

      setDrafts((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.contentHash === contentHash,
        );
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          const nextItem: DraftItem = {
            ...existing,
            ...draft,
            context: normalizedContext,
            contentHash,
            updatedAt: now,
          };
          return [
            nextItem,
            ...prev.slice(0, existingIndex),
            ...prev.slice(existingIndex + 1),
          ];
        }

        return [
          {
            id: crypto.randomUUID(),
            contentHash,
            ...draft,
            context: normalizedContext,
            updatedAt: now,
          },
          ...prev,
        ];
      });

      return contentHash;
    },
    [],
  );

  const promoteRecent = useCallback(
    (
      item: Omit<RecentItem, "id" | "contentHash" | "lastUsedAt" | "usedCount">,
    ) => {
      const normalizedContext = ensureContextDefaults(item.context);
      const contentHash = buildContentHash(
        normalizedContext,
        item.originalText,
      );
      const now = Date.now();

      setRecents((prev) => {
        const existingIndex = prev.findIndex(
          (entry) => entry.contentHash === contentHash,
        );
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          const updatedEntry: RecentItem = {
            ...existing,
            ...item,
            context: normalizedContext,
            contentHash,
            lastUsedAt: now,
            usedCount: existing.usedCount + 1,
          };
          const updated = [
            updatedEntry,
            ...prev.slice(0, existingIndex),
            ...prev.slice(existingIndex + 1),
          ];
          return updated.slice(0, MAX_RECENT_ITEMS);
        }

        const next: RecentItem = {
          id: crypto.randomUUID(),
          contentHash,
          ...item,
          context: normalizedContext,
          lastUsedAt: now,
          usedCount: 1,
        };
        return [next, ...prev].slice(0, MAX_RECENT_ITEMS);
      });

      return contentHash;
    },
    [],
  );

  const clearRecents = useCallback(() => {
    setRecents([]);
  }, []);

  const removeFromRecents = useCallback((id: string) => {
    setRecents((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    recents,
    drafts,
    isLoaded,
    saveDraft,
    promoteRecent,
    clearRecents,
    removeFromRecents,
  };
}

// Helper to format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
