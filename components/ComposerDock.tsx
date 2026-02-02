"use client";

import { useRef, useEffect, forwardRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IntentSentence } from "./IntentSentence";
import { SplitGenerateButton } from "./SplitGenerateButton";
import { ChannelRulesToggle } from "./ChannelRulesToggle";
import {
  type Intent,
  getAudienceLabel,
  getChannelLabel,
  getPersonaLabel,
  getToneLabel,
} from "@/lib/intent";
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
    const [showAllPresets, setShowAllPresets] = useState(false);

    const trimmedLength = value.trim().length;

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

    useEffect(() => {
      setShowAllPresets(false);
    }, [activePresetId]);

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

    const showPresetList = trimmedLength === 0;
    const isGenerateDisabled = trimmedLength < threshold;
    const showGenerateHint = trimmedLength > 0 && trimmedLength < threshold;

    function renderPresets() {
      if (hasContent || trimmedLength > 0) return null;
      const activePreset = presets.find(
        (preset) => preset.id === activePresetId
      );
      const filteredPresets = activePreset
        ? presets.filter(
            (preset) =>
              preset.context.channel === activePreset.context.channel &&
              preset.context.audience === activePreset.context.audience
          )
        : presets;
      const shouldCapPresets = Boolean(activePreset) && !showAllPresets;
      const visiblePresets = shouldCapPresets
        ? filteredPresets.slice(0, 3)
        : showAllPresets
        ? presets
        : filteredPresets;
      const showViewAll = shouldCapPresets && filteredPresets.length > 3;

      return (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {activePreset && !showAllPresets
                ? "More like this"
                : "Browse presets"}
            </span>
            {activePreset ? (
              <button
                type="button"
                onClick={() => setShowAllPresets((prev) => !prev)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAllPresets ? "Show less" : "Browse all presets"}
              </button>
            ) : null}
          </div>
          <div
            className={cn(
              "mt-2 overflow-y-auto transition-[max-height,opacity] duration-200",
              showPresetList
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            )}
          >
            <div
              className="grid gap-1.5"
              role="listbox"
              tabIndex={0}
              aria-label="Presets list"
            >
              {visiblePresets.map((preset) => {
                const channelLabel = getChannelLabel(preset.context.channel);
                const audienceLabel = getAudienceLabel(preset.context.audience);
                const toneLabel = getToneLabel(preset.context.tone);
                const roleLabel = getPersonaLabel(preset.context.role);
                const tags = [
                  channelLabel,
                  audienceLabel,
                  toneLabel,
                  roleLabel,
                ].slice(0, 3);
                const isActive = preset.id === activePresetId;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset)}
                    className={cn(
                      "group text-left rounded-md border px-3 py-2.5 min-h-[44px] transition-colors",
                      "border-border/50 hover:border-border hover:bg-muted/40",
                      "flex flex-col gap-1.5 cursor-pointer",
                      isActive ? "border-border bg-muted/40" : "bg-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                          {preset.title}
                        </span>
                        <span
                          className={cn(
                            "text-xs text-muted-foreground truncate",
                            "group-hover:whitespace-normal group-hover:overflow-visible",
                            isActive && "whitespace-normal overflow-visible"
                          )}
                        >
                          {preset.sentence}
                        </span>
                      </div>
                      <span className="text-muted-foreground/40 transition-all duration-150 ease-out group-hover:text-muted-foreground/70 group-hover:translate-x-0.5">
                        ›
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 overflow-hidden transition-[max-height,opacity] duration-150 ease-out",
                        isActive
                          ? "max-h-6 opacity-100"
                          : "max-h-0 opacity-0 group-hover:max-h-6 group-hover:opacity-100"
                      )}
                    >
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] text-muted-foreground/80 bg-muted/60 border border-border/60 rounded-full px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            {showViewAll ? (
              <button
                type="button"
                onClick={() => setShowAllPresets(true)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    // Centered mode: for initial state before any generation
    if (centered) {
      return (
        <div className={cn("w-full max-w-2xl mx-auto px-4", className)}>
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

          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="original-text"
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Paste or type your message here…"
              spellCheck={false}
              autoComplete="off"
              className="min-h-[100px] text-base resize-none border bg-card shadow-sm rounded-xl p-4 pr-32 pb-12 placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />

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

          {renderPresets()}
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
          <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              id="original-text"
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Paste or type your message here…"
              spellCheck={false}
              autoComplete="off"
              className="min-h-[72px] text-base resize-none border-0 p-3 placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />

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

          {renderPresets()}
        </div>
      </div>
    );
  }
);
