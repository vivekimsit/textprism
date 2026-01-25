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
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  usePreferences,
  WHO_I_AM_OPTIONS,
  TONE_OPTIONS,
  AUDIENCE_BY_CHANNEL,
  DEFAULT_AUDIENCE,
  CHANNEL_OPTIONS,
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
  MAX_CHARS,
  type Platform,
} from "@/lib/generate-prompt";

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
  const [channel, setChannel] = useState<Platform>("slack");
  const [audience, setAudience] = useState(DEFAULT_AUDIENCE["slack"]);
  const [tone, setTone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGeneratedPrompt, setShowGeneratedPrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update audience when channel changes
  useEffect(() => {
    setAudience(DEFAULT_AUDIENCE[channel]);
  }, [channel]);

  // Auto-grow textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  }, [message]);

  const effectiveTone = tone ?? preferences.defaultTone;
  const audienceOptions = AUDIENCE_BY_CHANNEL[channel] || [];

  const debouncedMessage = useDebounce(message, 300);

  const generatedPrompt = useMemo(() => {
    if (!canGenerate(debouncedMessage)) return "";

    return generatePrompt({
      message: debouncedMessage.trim(),
      channel,
      audience,
      tone: effectiveTone,
      whoIAm:
        WHO_I_AM_OPTIONS.find((o) => o.value === preferences.whoIAm)?.label ??
        preferences.whoIAm,
    });
  }, [debouncedMessage, channel, audience, effectiveTone, preferences.whoIAm]);

  const buildPreview = (input: string) => {
    const trimmed = input.trim();
    const maxLength = 160;
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, maxLength)}...`;
  };

  const getChannelLabel = (value: string) =>
    CHANNEL_OPTIONS.find((option) => option.value === value)?.label ?? value;

  const getAudienceLabel = (channelValue: string, value: string) =>
    AUDIENCE_BY_CHANNEL[channelValue]?.find((option) => option.value === value)
      ?.label ?? value;

  const getToneLabel = (value: string) =>
    TONE_OPTIONS.find((option) => option.value === value)?.label ?? value;

  const handleReuse = (item: HistoryItem) => {
    const input = item.input || item.inputPreview;
    setMessage(input);
    setChannel(item.channel as Platform);
    setAudience(item.audience);
    setTone(item.tone);
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
        channel,
        audience,
        tone: effectiveTone,
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
            Copy Prompt
          </>
        )}
      </Button>

      {/* Collapsible generated prompt - secondary, for advanced users */}
      <div className="space-y-2">
        <button
          onClick={() => setShowGeneratedPrompt(!showGeneratedPrompt)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
        >
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              showGeneratedPrompt && "rotate-180"
            )}
          />
          <span>
            {showGeneratedPrompt ? "Hide" : "View"} generated prompt
          </span>
        </button>

        {showGeneratedPrompt && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <pre className="text-xs bg-muted/30 rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground max-h-[180px] overflow-y-auto border">
              {generatedPrompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  ) : (
    <p className="text-xs text-muted-foreground text-center py-4">
      Write the rough version. We'll rewrite it.
    </p>
  );

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
                sidebarCollapsed ? "justify-center px-2" : "justify-between px-3"
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
                    !sidebarCollapsed ? "bg-muted/60 rounded-md" : "hover:bg-muted/60"
                  }`}
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  title={sidebarCollapsed ? "Expand recents" : "Collapse recents"}
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
                      const channelLabel = getChannelLabel(item.channel);
                      const audienceLabel = getAudienceLabel(
                        item.channel,
                        item.audience,
                      );
                      const toneLabel = getToneLabel(item.tone);

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
                setTone(null);
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
                <span>{showAdvancedSettings ? "Hide" : "Show"} advanced settings</span>
                <span className="text-[10px]">{showAdvancedSettings ? "▲" : "▼"}</span>
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
                        onValueChange={(value) => setCountry(value === "placeholder" ? "" : value)}
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
                        onValueChange={(value) => setJobCategory(value === "placeholder" ? "" : value)}
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
                        onValueChange={(value) => setCompanySize(value === "placeholder" ? "" : value)}
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
                        onValueChange={(value) => setYearsExperience(value === "placeholder" ? "" : value)}
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

          {/* Main Input Card */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {/* Progress line - top border */}
            <div className="h-0.5 bg-muted/30">
              <div
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  message.trim().length >= MIN_CHARS
                    ? "bg-green-500/40"
                    : "bg-red-500/30"
                )}
                style={{
                  width: `${Math.min((message.trim().length / MIN_CHARS) * 100, 100)}%`,
                }}
              />
            </div>

            {/* Textarea with counter */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What do you want to say?"
                className="min-h-[100px] text-base resize-none border-0 shadow-none focus-visible:ring-0 rounded-none p-4 placeholder:text-muted-foreground/50 overflow-hidden"
                autoFocus
              />

              {/* Counter - only shows when under minimum */}
              {message.trim().length < MIN_CHARS && message.trim().length > 0 && (
                <span className="absolute bottom-2 right-4 text-xs text-muted-foreground/50 pointer-events-none transition-opacity duration-200">
                  {MIN_CHARS - message.trim().length} more
                </span>
              )}
            </div>

            {/* Controls row - Channel left, To + Tone right */}
            <div className="px-4 pb-3 pt-0 flex items-center justify-between gap-3">
              {/* Left: Channel dropdown */}
              <Select
                value={channel}
                onValueChange={(value) => setChannel(value as Platform)}
              >
                <SelectTrigger className="h-8 w-auto rounded-full text-xs font-medium bg-primary text-primary-foreground border-0 shadow-none hover:bg-primary/90">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>
                      {ch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Right: Audience dropdown + Tone pill */}
              <div className="flex items-center gap-2">
                {audienceOptions.length > 1 && (
                  <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger className="h-8 w-auto rounded-full text-xs bg-muted/40 text-muted-foreground border-0 shadow-none hover:bg-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {audienceOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                )}
                <button
                  onClick={() => {
                    const currentIndex = TONE_OPTIONS.findIndex(
                      (t) => t.value === effectiveTone,
                    );
                    const nextIndex = (currentIndex + 1) % TONE_OPTIONS.length;
                    setTone(TONE_OPTIONS[nextIndex].value);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  title="Click to change tone"
                >
                  {TONE_OPTIONS.find((t) => t.value === effectiveTone)?.label ??
                    effectiveTone}
                </button>
              </div>
            </div>
          </div>

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
