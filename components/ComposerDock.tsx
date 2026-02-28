"use client";

import { useRef, useEffect, forwardRef, useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IntentSentence } from "./IntentSentence";
import { SplitGenerateButton } from "./SplitGenerateButton";
import { ChannelRulesToggle } from "./ChannelRulesToggle";
import { useCyclingPlaceholder } from "@/hooks/use-cycling-placeholder";
import { PRESETS } from "@/lib/presets";
import type { Intent } from "@/lib/intent";
import type { Preset } from "@/lib/presets";
import type { Platform } from "@/lib/generate-prompt";

interface ComposerDockProps {
  value: string;
  onChange: (value: string) => void;
  onInputBlur?: () => void;
  onGenerate?: () => void;
  threshold: number;
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  presets: Preset[];
  onApplyPreset: (preset: Preset) => void;
  activePresetId: string | null;
  highlightTokens?: Partial<
    Record<"channel" | "audience" | "tone" | "persona", boolean>
  >;
  /** When true, composer is centered in viewport instead of docked at bottom */
  centered?: boolean;
  /** Cursor position to restore after layout transition */
  initialCursorPosition?: { start: number; end: number } | null;
  /** Whether meta prompt is currently being generated */
  isGenerating?: boolean;
  /** Whether meta prompt has content */
  hasContent?: boolean;
  showGenerateCTA?: boolean;
  /** Whether user has an OpenAI API key configured */
  hasApiKey?: boolean;
  /** Callback for direct AI generation (bypasses manual meta prompt step) */
  onGenerateWithAi?: () => void;
  /** Show generate CTA in docked mode (e.g., when response is stale) */
  showDockedGenerateCTA?: boolean;
  /** Whether this is a regeneration (text changed after previous generation) */
  isRegenerate?: boolean;
  /** Channel rules props - shown in docked mode when AI mode is active */
  showChannelRules?: boolean;
  channel?: Platform;
  enabledRuleIds?: string[];
  onRuleToggle?: (ruleId: string, enabled: boolean) => void;
  className?: string;
}

export const ComposerDock = forwardRef<HTMLTextAreaElement, ComposerDockProps>(
  function ComposerDock(
    {
      value,
      onChange,
      onInputBlur,
      onGenerate,
      threshold,
      intent,
      onIntentChange,
      presets,
      onApplyPreset,
      activePresetId,
      highlightTokens,
      centered = false,
      initialCursorPosition,
      isGenerating = false,
      hasContent = false,
      showGenerateCTA = false,
      hasApiKey = false,
      onGenerateWithAi,
      showDockedGenerateCTA = false,
      isRegenerate = false,
      showChannelRules = false,
      channel,
      enabledRuleIds,
      onRuleToggle,
      className,
    },
    ref
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);

    const trimmedLength = value.trim().length;
    const placeholderItems = useMemo(
      () => PRESETS.map((p) => p.sentence),
      []
    );
    const { current: placeholderText, key: placeholderKey } =
      useCyclingPlaceholder(placeholderItems, 2500, {
        paused: trimmedLength > 0,
      });

    // Restore cursor position when provided (after layout transition)
    const hasRestoredRef = useRef(false);
    useEffect(() => {
      if (initialCursorPosition && !hasRestoredRef.current) {
        const textarea = textareaRef.current;
        if (textarea) {
          hasRestoredRef.current = true;
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
              initialCursorPosition.start,
              initialCursorPosition.end
            );
          });
        }
      }
    }, [initialCursorPosition, textareaRef]);

    // Auto-grow textarea based on content
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }, [value, textareaRef]);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      onChange(e.target.value);
    }

    function handleFocus() {
      setIsTextareaFocused(true);
    }

    function handleBlur(e: React.FocusEvent) {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget?.closest("[data-intent-token]")) {
        setTimeout(() => textareaRef.current?.focus(), 0);
        return;
      }
      setIsTextareaFocused(false);
      onInputBlur?.();
    }

    const isGenerateDisabled = trimmedLength < threshold;
    const showGenerateHint = trimmedLength > 0 && trimmedLength < threshold;

    // Centered mode: for initial state before any generation
    if (centered) {
      return (
        <div className={cn("w-full max-w-2xl mx-auto px-4", className)}>
          {trimmedLength > 0 && (
            <>
              {/* Intent sentence with helper/status */}
              <IntentSentence
                intent={intent}
                onIntentChange={onIntentChange}
                isExternalActive={isTextareaFocused}
                compact
                inputLength={trimmedLength}
                threshold={threshold}
                isGenerating={isGenerating}
                hasContent={hasContent}
                highlightTokens={highlightTokens}
                className="mb-3"
              />

              {/* Label */}
              <label
                htmlFor="original-text"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Original text
              </label>
            </>
          )}

          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="original-text"
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder=""
              spellCheck={false}
              autoComplete="off"
              className="min-h-[100px] text-base resize-none border bg-card shadow-sm rounded-xl p-4 pr-32 pb-12 focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />
            {trimmedLength === 0 && (
              <span
                key={placeholderKey}
                className="absolute inset-0 p-4 pr-32 pb-12 flex items-start text-base text-muted-foreground/50 pointer-events-none select-none animate-in fade-in duration-500"
                aria-hidden
              >
                {placeholderText}
              </span>
            )}

            {showGenerateCTA ? (
              <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                {hasApiKey && onGenerateWithAi ? (
                  <SplitGenerateButton
                    onGenerateWithAi={onGenerateWithAi}
                    onGenerateMetaPrompt={onGenerate || (() => {})}
                    disabled={isGenerateDisabled}
                    isRegenerate={isRegenerate}
                  />
                ) : (
                  <Button
                    type="button"
                    onClick={onGenerate}
                    disabled={isGenerateDisabled}
                  >
                    {isRegenerate
                      ? "Regenerate meta prompt"
                      : "Generate meta prompt"}
                  </Button>
                )}
                {showGenerateHint ? (
                  <span className="text-[11px] text-muted-foreground/70">
                    {threshold - trimmedLength} more character
                    {threshold - trimmedLength === 1 ? "" : "s"} needed
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    // Docked mode: sticky at bottom after generation
    return (
      <div
        className={cn(
          "sticky bottom-0 left-0 right-0 z-20",
          "bg-muted/30 border-t border-border/50",
          "backdrop-blur-sm",
          "animate-in slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        <div className="px-4 pt-3 pb-8 max-w-2xl mx-auto">
          {/* Intent sentence with helper/status */}
          <IntentSentence
            intent={intent}
            onIntentChange={onIntentChange}
            isExternalActive={isTextareaFocused}
            compact
            inputLength={trimmedLength}
            threshold={threshold}
            isGenerating={isGenerating}
            hasContent={hasContent}
            highlightTokens={highlightTokens}
            className="mb-2"
          />

          {/* Rich text editor style container */}
          <div className="rounded-xl border bg-background shadow-sm overflow-hidden relative">
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              id="original-text"
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder=""
              spellCheck={false}
              autoComplete="off"
              className="min-h-[72px] text-base resize-none border-0 p-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {trimmedLength === 0 && (
              <span
                key={placeholderKey}
                className="absolute inset-0 p-3 flex items-start text-base text-muted-foreground/50 pointer-events-none select-none animate-in fade-in duration-500"
                aria-hidden
              >
                {placeholderText}
              </span>
            )}

            {/* Toolbar - channel rules and generate button */}
            {(showChannelRules || showDockedGenerateCTA) && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-t bg-muted/30">
                {/* Channel Rules - icon toggles */}
                {showChannelRules &&
                channel &&
                enabledRuleIds &&
                onRuleToggle ? (
                  <ChannelRulesToggle
                    channel={channel}
                    enabledRuleIds={enabledRuleIds}
                    onToggle={onRuleToggle}
                    compact
                  />
                ) : (
                  <div />
                )}

                {/* Generate button */}
                {showDockedGenerateCTA && (
                  <div className="shrink-0">
                    {hasApiKey && onGenerateWithAi ? (
                      <SplitGenerateButton
                        onGenerateWithAi={onGenerateWithAi}
                        onGenerateMetaPrompt={onGenerate || (() => {})}
                        disabled={isGenerateDisabled}
                        isRegenerate={isRegenerate}
                      />
                    ) : (
                      <Button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerateDisabled}
                        size="sm"
                      >
                        {isRegenerate ? "Regenerate" : "Generate"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
