"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AiResponseCardProps {
  response: string;
  isLoading: boolean;
  error: string | null;
  className?: string;
  /** Whether the response is stale (input has changed) */
  isStale?: boolean;
}

export function AiResponseCard({
  response,
  isLoading,
  error,
  className,
  isStale = false,
}: AiResponseCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success("Copied!", {
        description: "AI response copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  // Don't render if no content, loading, or error
  if (!response && !isLoading && !error) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card overflow-hidden flex flex-col",
        "animate-in fade-in slide-in-from-top-2 duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            AI Response
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {response && !isLoading && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-3 text-xs font-medium bg-foreground text-background hover:bg-foreground/90"
              title="Copy AI response"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Body - scrollable area */}
      <div className="overflow-y-auto max-h-[400px]">
        <div className="p-4">
          {error ? (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="font-medium">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : isLoading && !response ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:300ms]" />
              </span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - status */}
      {!error && !isLoading && (
        <div className="px-4 py-2 border-t bg-muted/10">
          {isStale ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
              Input has changed
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/70">
              Response ready
            </span>
          )}
        </div>
      )}
    </div>
  );
}
