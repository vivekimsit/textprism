"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChannelRulesToggle } from "./ChannelRulesToggle";
import type { Platform } from "@/lib/generate-prompt";

interface MetaPromptCardProps {
  metaPrompt: string;
  isGenerating: boolean;
  hasEnoughText: boolean;
  /** Intent summary for sublabel, e.g. "Slack → Team · Direct · Tech Lead" */
  intentSummary?: string;
  /** Current channel for channel rules */
  channel?: Platform;
  /** Currently enabled rule IDs for the channel */
  enabledRuleIds?: string[];
  /** Callback when a rule is toggled */
  onRuleToggle?: (ruleId: string, enabled: boolean) => void;
  onCopy?: () => void;
  onExpand?: () => void;
  className?: string;
}

export function MetaPromptCard({
  metaPrompt,
  isGenerating,
  hasEnoughText,
  intentSummary,
  channel,
  enabledRuleIds,
  onRuleToggle,
  onCopy,
  onExpand,
  className,
}: MetaPromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasEverGenerated, setHasEverGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasContent = metaPrompt.length > 0;
  const isReady = hasEnoughText && hasContent && !isGenerating;

  // Track if we've ever generated content (for auto-expand)
  useEffect(() => {
    if (hasContent && !hasEverGenerated) {
      setHasEverGenerated(true);
      setIsExpanded(true); // Auto-expand on first generation
    }
  }, [hasContent, hasEverGenerated]);

  async function handleCopy() {
    if (!isReady || !metaPrompt) return;

    try {
      await navigator.clipboard.writeText(metaPrompt);
      setCopied(true);
      toast.success("Copied!", { description: "Paste into your AI tool" });
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  function handleToggleExpand() {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        onExpand?.();
      }
      return next;
    });
  }

  // === EMPTY STATE: Before any generation ===
  // Minimal header-only card with stronger affordance
  if (!hasContent && !isGenerating) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/70 bg-muted/5 overflow-hidden",
          className,
        )}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-sm text-muted-foreground/70">Meta prompt</span>
          <span className="text-xs text-muted-foreground/50">Appears here</span>
        </div>
      </div>
    );
  }

  // === GENERATING STATE: Typing but waiting for debounce ===
  if (isGenerating && !hasContent) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/50 bg-card overflow-hidden",
          className,
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            Meta prompt
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:300ms]" />
            </span>
          </span>
          <span className="text-xs text-muted-foreground/60">Generating…</span>
        </div>
      </div>
    );
  }

  // === CONTENT STATE: Has generated content ===
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card overflow-hidden flex flex-col",
        "animate-in fade-in slide-in-from-top-2 duration-200",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Meta prompt
            </span>
            {isGenerating ? (
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:300ms]" />
              </span>
            ) : null}
          </div>
          {/* Intent summary sublabel */}
          {intentSummary ? (
            <span className="text-[10px] text-muted-foreground/50">
              {intentSummary}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Copy button - primary action */}
          <Button
            variant={isReady ? "default" : "ghost"}
            size="sm"
            onClick={handleCopy}
            disabled={!isReady}
            className={cn(
              "h-7 px-3 text-xs font-medium",
              isReady
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "text-muted-foreground",
            )}
            title={isReady ? "Copy meta prompt" : "Updating…"}
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
          {/* Chevron - secondary */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleExpand}
            className="h-7 w-7 text-muted-foreground/60 hover:text-muted-foreground"
            title={isExpanded ? "Collapse" : "Expand"}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Channel Rules Toggle Section */}
      {channel && enabledRuleIds && onRuleToggle ? (
        <div className="px-4 py-3 border-b bg-muted/10">
          <ChannelRulesToggle
            channel={channel}
            enabledRuleIds={enabledRuleIds}
            onToggle={onRuleToggle}
          />
        </div>
      ) : null}

      {/* Body - scrollable area */}
      <div
        className={cn(
          "overflow-y-auto transition-[max-height] duration-200 ease-out",
          isExpanded ? "max-h-[320px]" : "max-h-[72px]",
        )}
      >
        <div className="p-4">
          <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap wrap-break-word">
            {metaPrompt}
          </pre>
        </div>
      </div>

      {/* Fade overlay when collapsed */}
      {!isExpanded ? (
        <div className="h-6 bg-linear-to-t from-card to-transparent -mt-6 pointer-events-none relative z-10" />
      ) : null}

      {/* Footer - status */}
      <div className="px-4 py-2 border-t bg-muted/10">
        <span
          className={cn(
            "text-xs",
            isGenerating ? "text-muted-foreground" : "text-muted-foreground/70",
          )}
        >
          {isGenerating ? "Updating…" : "Prompt ready to copy"}
        </span>
      </div>
    </div>
  );
}
