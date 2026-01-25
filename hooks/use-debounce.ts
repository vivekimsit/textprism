import { useState, useEffect } from "react";

/**
 * Debounce a value - only updates after the specified delay
 * Good for: search inputs, form validation, preview generation
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle a value - updates at most once per interval
 * Good for: scroll handlers, resize handlers, real-time updates
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      setLastUpdated(now);
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        setLastUpdated(Date.now());
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, interval, lastUpdated]);

  return throttledValue;
}
