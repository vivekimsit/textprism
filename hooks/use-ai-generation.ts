"use client";

import { useState, useCallback } from "react";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface UseAiGenerationOptions {
  apiKey: string;
  model?: string;
}

export interface UseAiGenerationResult {
  generate: (messages: Message[]) => Promise<void>;
  response: string;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useAiGeneration({
  apiKey,
  model = "gpt-4o-mini",
}: UseAiGenerationOptions): UseAiGenerationResult {
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (messages: Message[]) => {
      if (!apiKey) {
        setError("API key is required");
        return;
      }

      setIsLoading(true);
      setError(null);
      setResponse("");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey,
            messages,
            model,
          }),
        });

        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${res.status}`
          );
        }

        // Handle streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });

          // Check for our custom error format first
          if (chunk.includes("__ERROR__:")) {
            const errorMatch = chunk.match(/__ERROR__:(.+)$/);
            if (errorMatch) {
              try {
                const errorData = JSON.parse(errorMatch[1]);
                throw new Error(errorData.error || "An error occurred");
              } catch (e) {
                if (e instanceof Error) {
                  throw e;
                }
              }
            }
          }

          // Plain text stream - just accumulate
          accumulatedText += chunk;
          setResponse(accumulatedText);
        }

        // Check if the final response contains an error marker
        if (accumulatedText.includes("__ERROR__:")) {
          const errorMatch = accumulatedText.match(/__ERROR__:(.+)$/);
          if (errorMatch) {
            try {
              const errorData = JSON.parse(errorMatch[1]);
              setError(errorData.error || "An error occurred");
              setResponse(""); // Clear the response since it contains error
              setIsLoading(false);
              return;
            } catch {
              // Ignore parse error
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate response";
        setError(errorMessage);
        setResponse(""); // Clear any partial response on error
        setIsLoading(false);
      }
    },
    [apiKey, model]
  );

  const reset = useCallback(() => {
    setResponse("");
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    generate,
    response,
    isLoading,
    error,
    reset,
  };
}
