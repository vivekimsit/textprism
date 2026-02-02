"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ShowPromptToggleProps {
  metaPrompt: string;
  intentSummary?: string;
  className?: string;
}

export function ShowPromptToggle({
  metaPrompt,
  intentSummary,
  className,
}: ShowPromptToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!metaPrompt) return;

    try {
      await navigator.clipboard.writeText(metaPrompt);
      setCopied(true);
      toast.success("Copied!", { description: "Meta prompt copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (!metaPrompt) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border/50 overflow-hidden transition-all duration-200",
        "animate-in fade-in slide-in-from-top-2",
        className
      )}
    >
      {/* Collapsed state - just a link */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-all duration-150"
          aria-label="View meta prompt"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              View meta prompt
            </span>
            {intentSummary ? (
              <span className="text-[10px] text-muted-foreground/50">
                {intentSummary}
              </span>
            ) : null}
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
        </button>
      ) : (
        // Expanded state - show prompt with copy button
        <>
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Meta prompt
              </span>
              {intentSummary ? (
                <span className="text-[10px] text-muted-foreground/50">
                  {intentSummary}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 text-xs"
                title="Copy meta prompt"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6"
                title="Collapse"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="px-3 py-2 max-h-[200px] overflow-y-auto bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-150">
            <pre className="text-xs font-mono text-muted-foreground/70 whitespace-pre-wrap">
              {metaPrompt}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
