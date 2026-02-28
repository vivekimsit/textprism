"use client";

import { useState, useEffect } from "react";

export interface CyclingPlaceholderResult {
  current: string;
  key: number;
}

/**
 * Cycles through an array of strings at a given interval.
 * When paused (e.g., textarea focused or has content), stops advancing.
 */
export function useCyclingPlaceholder(
  items: string[],
  intervalMs: number,
  options?: { paused?: boolean }
): CyclingPlaceholderResult {
  const [index, setIndex] = useState(() =>
    items.length > 0 ? Math.floor(Math.random() * items.length) : 0
  );
  const [key, setKey] = useState(0);
  const paused = options?.paused ?? false;

  useEffect(() => {
    if (items.length === 0) return;
    if (paused) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
      setKey((k) => k + 1);
    }, intervalMs);

    return () => clearInterval(id);
  }, [items.length, intervalMs, paused]);

  const current = items[index] ?? "";

  return { current, key };
}
