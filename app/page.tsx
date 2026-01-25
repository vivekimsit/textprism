"use client";

import { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Textarea } from "@/components/ui/textarea";
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
  Check,
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
  TONE_OPTIONS as TONE_OPTIONS_PREF,
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
  MIN_CHARS,
  type Platform,
} from "@/lib/generate-prompt";
import { IntentSentenceBar } from "@/components/IntentSentenceBar";
import {
  type Intent,
  DEFAULT_INTENT,
  getPersonaLabel,
  CHANNEL_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/intent";

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

  const [message, setMessage] = useState("");
  const [intent, setIntent] = useState<Intent>(DEFAULT_INTENT);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGeneratedPrompt, setShowGeneratedPrompt] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-grow textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  }, [message]);

  const debouncedMessage = useDebounce(message, 300);

  const generatedPrompt = useMemo(() => {
    if (!canGenerate(debouncedMessage)) return "";

    return generatePrompt({
      message: debouncedMessage.trim(),
      channel: intent.channel as Platform,
      audience: intent.audience ?? "team",
      tone: intent.tone,
      whoIAm: getPersonaLabel(intent.persona),
    });
  }, [debouncedMessage, intent]);

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

  const handleReuse = (item: HistoryItem) => {
    const input = item.input || item.inputPreview;
    setMessage(input);
    // Map history item back to intent (using defaults for persona)
    setIntent({
      channel: item.channel as Intent["channel"],
      audience: item.audience as Intent["audience"],
      tone: item.tone as Intent["tone"],
      persona: intent.persona, // Keep current persona
    });
  };

  const handleDuplicate = (item: HistoryItem) => {
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
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success("Copied!", { description: "Paste into your AI tool" });

      const trimmedMessage = message.trim();
      addToHistory({
        channel: intent.channel,
        audience: intent.audience ?? "team",
        tone: intent.tone,
        input: trimmedMessage,
        inputPreview: buildPreview(trimmedMessage),
        prompt: generatedPrompt,
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const showPreview = canGenerate(message) && generatedPrompt;
  const showSidebar = history.length > 0;

  // Get a short preview of the generated prompt (first ~60 chars)
  const promptPreview = generatedPrompt
    ? generatedPrompt.slice(0, 60).trim() + (generatedPrompt.length > 60 ? "…" : "")
    : "";

  const previewPanel = showPreview ? (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Primary action - always visible */}
      <Button onClick={handleCopy} className="w-full rounded-full h-10">
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy meta prompt
          </>
        )}
      </Button>

      {/* Helper text + status */}
      <div className="text-center space-y-0.5">
        <p className="text-xs text-muted-foreground/70">
          Paste this into ChatGPT, Claude, or any AI assistant
        </p>
        <p className="text-xs text-muted-foreground/50">
          {message.trim() !== debouncedMessage.trim() ? "Updating…" : "Ready"}
        </p>
      </div>

      {/* Collapsible meta prompt panel - header stub always visible */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {showGeneratedPrompt ? (
          <>
            <button
              onClick={() => setShowGeneratedPrompt(false)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/20 hover:bg-muted/30 transition-colors text-left"
            >
              <span className="text-xs text-muted-foreground">
                Meta prompt (paste into AI)
              </span>
              <span className="text-xs text-muted-foreground/70">▾</span>
            </button>
            <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground max-h-[180px] overflow-y-auto border-t animate-in fade-in slide-in-from-top-1 duration-150">
              {generatedPrompt}
            </pre>
          </>
        ) : (
          /* Collapsed state - entire area clickable with hover affordance */
          <button
            onClick={() => setShowGeneratedPrompt(true)}
            className="w-full text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 group-hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground">
                Meta prompt (paste into AI)
              </span>
              <span className="text-xs text-muted-foreground/70 transition-transform duration-200 group-hover:translate-x-0.5">
                ▸
              </span>
            </div>
            <p className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground/70 px-4 py-2 border-t truncate font-mono transition-colors">
              {promptPreview}
            </p>
          </button>
        )}
      </div>
    </div>
  ) : null;

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
      {showSidebar && (
        <aside
          className={`${
            sidebarCollapsed ? "w-[52px]" : "w-60"
          } shrink-0 h-screen sticky top-0 transition-all duration-200`}
        >
          <div className="h-full bg-muted/30 border-r border-border/40 flex flex-col">
            {/* Header */}
            <div
              className={`flex items-center h-12 ${
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-between px-3"
              }`}
            >
              {!sidebarCollapsed && (
                <span className="text-sm font-semibold text-foreground">
                  Recent prompts
                </span>
              )}
              <div
                className={`flex items-center ${
                  sidebarCollapsed ? "flex-col gap-1" : "gap-0.5"
                }`}
              >
                {!sidebarCollapsed && (
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
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-muted-foreground hover:text-foreground ${
                    !sidebarCollapsed
                      ? "bg-muted/60 rounded-md"
                      : "hover:bg-muted/60"
                  }`}
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
                        item.channel,
                      );
                      const audienceLabel = getAudienceLabelForHistory(
                        item.channel,
                        item.audience,
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
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-4">
          {/* Header - logo anchored left, controls right */}
          <div className="flex items-center justify-between">
            <Logo
              className="text-foreground"
              onClick={() => {
                setMessage("");
                setIntent(DEFAULT_INTENT);
                textareaRef.current?.focus();
              }}
            />
            <div className="flex gap-2">
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
                {isMounted &&
                  (resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  ))}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={`h-8 px-2 ${showSettings ? "bg-muted" : ""}`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border rounded-2xl bg-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
              {showAdvancedSettings && (
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
                            value === "placeholder" ? "" : value,
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
              )}
            </div>
          )}

          {/* Intent Sentence Bar */}
          <IntentSentenceBar intent={intent} onIntentChange={setIntent} />

          {/* Main Input Card */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {/* Progress line - top border (only visible when focused) */}
            {isTextareaFocused && (
              <div className="h-0.5 bg-muted/30">
                <div
                  className={cn(
                    "h-full transition-all duration-300 ease-out",
                    message.trim().length >= MIN_CHARS
                      ? "bg-green-500/40"
                      : "bg-red-500/30",
                  )}
                  style={{
                    width: `${Math.min((message.trim().length / MIN_CHARS) * 100, 100)}%`,
                  }}
                />
              </div>
            )}

            {/* Textarea with counter */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
                placeholder="Original text to transform"
                spellCheck={false}
                className="min-h-[100px] text-base resize-none border-0 shadow-none focus-visible:ring-0 rounded-none p-4 placeholder:text-muted-foreground/50 overflow-hidden"
                autoFocus
              />

              {/* Counter - only shows when focused and under minimum */}
              {isTextareaFocused &&
                message.trim().length < MIN_CHARS &&
                message.trim().length > 0 && (
                  <span className="absolute bottom-2 right-4 text-xs text-muted-foreground/50 pointer-events-none transition-opacity duration-200">
                    {MIN_CHARS - message.trim().length} more
                  </span>
                )}
            </div>
          </div>

          {/* Inline guidance - directly under input when empty */}
          {!showPreview && (
            <p className="text-xs text-muted-foreground/60 mt-2">
              Start typing to generate a meta prompt automatically
            </p>
          )}

          {previewPanel}
        </div>
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
