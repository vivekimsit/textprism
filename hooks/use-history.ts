"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "textprism-history";
const MAX_HISTORY_ITEMS = 10;

export interface HistoryItem {
  id: string;
  timestamp: number;
  channel: string;
  audience: string;
  tone: string;
  inputPreview: string; // First 60 chars of input
  prompt: string; // Full generated prompt
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when history changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch {
        // Ignore storage errors
      }
    }
  }, [history, isLoaded]);

  const addToHistory = useCallback(
    (item: Omit<HistoryItem, "id" | "timestamp">) => {
      const newItem: HistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev];
        // Keep only the last MAX_HISTORY_ITEMS
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });

      return newItem;
    },
    [],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    history,
    isLoaded,
    addToHistory,
    clearHistory,
    removeFromHistory,
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
