"use client";

import { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Settings,
  Trash2,
  X,
  Sun,
  Moon,
  PanelLeft,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  usePreferences,
  WHO_I_AM_OPTIONS,
  AUDIENCE_BY_CHANNEL,
  COUNTRY_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  YEARS_EXPERIENCE_OPTIONS,
} from "@/hooks/use-preferences";
import { useHistory, type HistoryItem } from "@/hooks/use-history";
import {
  generatePrompt,
  canGenerate,
  THRESHOLD,
  type Platform,
} from "@/lib/generate-prompt";
import { MetaPromptCard } from "@/components/MetaPromptCard";
import { ComposerDock } from "@/components/ComposerDock";
import {
  type Intent,
  DEFAULT_INTENT,
  getPersonaLabel,
  getChannelLabel,
  getAudienceLabel,
  getToneLabel,
  CHANNEL_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/intent";

const FEEDBACK_URL = "https://github.com/vivekimsit/textprism/discussions";

function HomeContent() {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const {
    preferences,
    isLoaded,
    setWhoIAm,
    setDefaultTone,
    setCountry,
    setJobCategory,
    setCompanySize,
    setYearsExperience,
  } = usePreferences();
  const { history, addToHistory, clearHistory, removeFromHistory } =
    useHistory();

  // Core state
  const [inputText, setInputText] = useState("");
  const [intent, setIntent] = useState<Intent>(DEFAULT_INTENT);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasEverGenerated, setHasEverGenerated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Track cursor position for layout transition
  const [savedCursorPosition, setSavedCursorPosition] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounce input with 600ms delay for meta prompt generation
  const debouncedInputText = useDebounce(inputText, 600);

  // Derived state
  const hasEnoughText = inputText.trim().length >= THRESHOLD;
  const isGenerating = inputText.trim() !== debouncedInputText.trim() && hasEnoughText;

  // Generate meta prompt
  const metaPrompt = useMemo(() => {
    if (!canGenerate(debouncedInputText)) return "";

    return generatePrompt({
      message: debouncedInputText.trim(),
      channel: intent.channel as Platform,
      audience: intent.audience ?? "team",
      tone: intent.tone,
      whoIAm: getPersonaLabel(intent.persona),
    });
  }, [debouncedInputText, intent]);

  // Track first generation to transition from centered to docked layout
  useEffect(() => {
    if (metaPrompt.length > 0 && !hasEverGenerated) {
      // Save cursor position before transitioning layouts
      const textarea = textareaRef.current;
      if (textarea) {
        setSavedCursorPosition({
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
        });
      }
      setHasEverGenerated(true);
    }
  }, [metaPrompt, hasEverGenerated]);

  // Intent summary for MetaPromptCard sublabel
  const intentSummary = useMemo(() => {
    const channel = getChannelLabel(intent.channel);
    const audience = intent.audience ? getAudienceLabel(intent.audience) : "";
    const tone = getToneLabel(intent.tone);
    const persona = getPersonaLabel(intent.persona);
    
    const parts = [channel];
    if (audience) parts.push(audience);
    parts.push(tone, persona);
    
    return parts.join(" · ");
  }, [intent]);

  const buildPreview = (input: string) => {
    const trimmed = input.trim();
    const maxLength = 160;
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, maxLength)}...`;
  };

  const getChannelLabelForHistory = (value: string) =>
    CHANNEL_OPTIONS.find((option) => option.value === value)?.label ?? value;

  const getAudienceLabelForHistory = (channelValue: string, value: string) =>
    AUDIENCE_BY_CHANNEL[channelValue]?.find((option) => option.value === value)
      ?.label ?? value;

  const getToneLabelForHistory = (value: string) =>
    TONE_OPTIONS.find((option) => option.value === value)?.label ?? value;

  function handleReuse(item: HistoryItem) {
    const input = item.input || item.inputPreview;
    setInputText(input);
    // Map history item back to intent (using defaults for persona)
    setIntent({
      channel: item.channel as Intent["channel"],
      audience: item.audience as Intent["audience"],
      tone: item.tone as Intent["tone"],
      persona: intent.persona, // Keep current persona
    });
  }

  function handleDuplicate(item: HistoryItem) {
    const input = item.input || item.inputPreview;
    addToHistory({
      channel: item.channel as Platform,
      audience: item.audience,
      tone: item.tone,
      input,
      inputPreview: buildPreview(input),
      prompt: item.prompt,
    });
    toast.success("Duplicated!");
  }

  function handleCopyCallback() {
    // Add to history when copy is triggered
    const trimmedInput = inputText.trim();
    if (metaPrompt && trimmedInput) {
      addToHistory({
        channel: intent.channel,
        audience: intent.audience ?? "team",
        tone: intent.tone,
        input: trimmedInput,
        inputPreview: buildPreview(trimmedInput),
        prompt: metaPrompt,
      });
    }
  }

  function handleReset() {
    setInputText("");
    setIntent(DEFAULT_INTENT);
    textareaRef.current?.focus();
  }

  const showSidebar = history.length > 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {showSidebar ? (
        <aside
          className={cn(
            "shrink-0 h-screen sticky top-0 transition-all duration-200",
            sidebarCollapsed ? "w-[52px]" : "w-60"
          )}
        >
          <div className="h-full bg-muted/30 border-r border-border/40 flex flex-col">
            {/* Header */}
            <div
              className={cn(
                "flex items-center h-12",
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-between px-3"
              )}
            >
              {!sidebarCollapsed ? (
                <span className="text-sm font-semibold text-foreground">
                  Recent prompts
                </span>
              ) : null}
              <div
                className={cn(
                  "flex items-center",
                  sidebarCollapsed ? "flex-col gap-1" : "gap-0.5"
                )}
              >
                {!sidebarCollapsed ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    onClick={clearHistory}
                    title="Clear history"
                    aria-label="Clear history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-muted-foreground hover:text-foreground",
                    !sidebarCollapsed
                      ? "bg-muted/60 rounded-md"
                      : "hover:bg-muted/60"
                  )}
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  title={
                    sidebarCollapsed ? "Expand recents" : "Collapse recents"
                  }
                  aria-label={
                    sidebarCollapsed ? "Expand recents" : "Collapse recents"
                  }
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            {!sidebarCollapsed ? (
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {history.length > 0 ? (
                  <div className="space-y-1">
                    {history.map((item) => {
                      const channelLabel = getChannelLabelForHistory(
                        item.channel
                      );
                      const audienceLabel = getAudienceLabelForHistory(
                        item.channel,
                        item.audience
                      );
                      const toneLabel = getToneLabelForHistory(item.tone);

                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-muted/60 transition-colors group cursor-pointer"
                          onClick={() => handleReuse(item)}
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-sm text-foreground line-clamp-2 whitespace-pre-wrap">
                              {item.input || item.inputPreview}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {channelLabel} · {audienceLabel} · {toneLabel}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(item);
                              }}
                              title="Duplicate"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item.id);
                              }}
                              title="Delete"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground px-1 py-3">
                    Your prompts will appear here once you start copying.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </aside>
      ) : null}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Layout depends on whether we've generated content yet */}
        {hasEverGenerated ? (
          // === DOCKED LAYOUT: After first generation ===
          <>
            {/* Scrollable content area - pb accounts for sticky dock height */}
            <div className="flex-1 flex flex-col px-4 pt-6 pb-[100px]">
              <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
                {/* Top Bar - logo anchored left, controls right */}
                <div className="flex items-center justify-between">
              <Logo
                className="text-foreground"
                onClick={handleReset}
              />
              <div className="flex items-center gap-3">
                <a
                  href={FEEDBACK_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Leave feedback"
                >
                  Feedback
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className="h-8 px-2"
                  title="Toggle dark mode"
                  aria-label="Toggle dark mode"
                  disabled={!isMounted}
                >
                  {isMounted ? (
                    resolvedTheme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )
                  ) : null}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn("h-8 px-2", showSettings ? "bg-muted" : "")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings ? (
              <div className="p-4 border rounded-2xl bg-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Defaults</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Who I am
                    </label>
                    <Select value={preferences.whoIAm} onValueChange={setWhoIAm}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WHO_I_AM_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Default Tone
                    </label>
                    <Select
                      value={preferences.defaultTone}
                      onValueChange={setDefaultTone}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <span>
                    {showAdvancedSettings ? "Hide" : "Show"} advanced settings
                  </span>
                  <span className="text-[10px]">
                    {showAdvancedSettings ? "▲" : "▼"}
                  </span>
                </button>

                {/* Advanced Settings */}
                {showAdvancedSettings ? (
                  <div className="space-y-4 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="text-xs text-muted-foreground">
                      These help generate more contextually relevant prompts
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          Country
                        </label>
                        <Select
                          value={preferences.country || "placeholder"}
                          onValueChange={(value) =>
                            setCountry(value === "placeholder" ? "" : value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placeholder" disabled>
                              Select country
                            </SelectItem>
                            {COUNTRY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          Industry
                        </label>
                        <Select
                          value={preferences.jobCategory || "placeholder"}
                          onValueChange={(value) =>
                            setJobCategory(value === "placeholder" ? "" : value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placeholder" disabled>
                              Select industry
                            </SelectItem>
                            {JOB_CATEGORY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          Company Size
                        </label>
                        <Select
                          value={preferences.companySize || "placeholder"}
                          onValueChange={(value) =>
                            setCompanySize(value === "placeholder" ? "" : value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placeholder" disabled>
                              Select size
                            </SelectItem>
                            {COMPANY_SIZE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          Experience
                        </label>
                        <Select
                          value={preferences.yearsExperience || "placeholder"}
                          onValueChange={(value) =>
                            setYearsExperience(
                              value === "placeholder" ? "" : value
                            )
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placeholder" disabled>
                              Select experience
                            </SelectItem>
                            {YEARS_EXPERIENCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Meta Prompt Card - pushed down to connect with composer */}
            <MetaPromptCard
              className="mt-auto pt-4"
              metaPrompt={metaPrompt}
              isGenerating={isGenerating}
              hasEnoughText={hasEnoughText}
              intentSummary={intentSummary}
              onCopy={handleCopyCallback}
            />
              </div>
            </div>

            {/* Sticky Composer Dock at bottom */}
            <ComposerDock
              ref={textareaRef}
              value={inputText}
              onChange={setInputText}
              threshold={THRESHOLD}
              intent={intent}
              onIntentChange={setIntent}
              initialCursorPosition={savedCursorPosition}
              isGenerating={isGenerating}
              hasContent={metaPrompt.length > 0}
            />
          </>
        ) : (
          // === CENTERED LAYOUT: Initial state before any generation ===
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            {/* Logo centered above */}
            <div className="mb-8">
              <Logo
                className="text-foreground"
                onClick={handleReset}
              />
            </div>

            {/* Centered composer */}
            <ComposerDock
              ref={textareaRef}
              value={inputText}
              onChange={setInputText}
              threshold={THRESHOLD}
              intent={intent}
              onIntentChange={setIntent}
              centered
              isGenerating={isGenerating}
              hasContent={metaPrompt.length > 0}
            />

            {/* Theme toggle in corner */}
            <div className="fixed top-4 right-4 flex items-center gap-3">
              <a
                href={FEEDBACK_URL}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Leave feedback"
              >
                Feedback
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="h-8 px-2"
                title="Toggle dark mode"
                aria-label="Toggle dark mode"
                disabled={!isMounted}
              >
                {isMounted ? (
                  resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )
                ) : null}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={cn("h-8 px-2", showSettings ? "bg-muted" : "")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
