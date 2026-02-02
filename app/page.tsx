"use client";

import {
  Suspense,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  Plus,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import {
  usePreferences,
  WHO_I_AM_OPTIONS,
  AUDIENCE_BY_CHANNEL,
  COUNTRY_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  YEARS_EXPERIENCE_OPTIONS,
} from "@/hooks/use-preferences";
import { useHistory, type RecentItem, type DraftItem } from "@/hooks/use-history";
import {
  generatePrompt,
  canGenerate,
  THRESHOLD,
  type Platform,
} from "@/lib/generate-prompt";
import {
  CHANNEL_RULES,
  getDefaultEnabledRules,
  buildChannelRulesText,
} from "@/lib/channel-rules";
import { MetaPromptCard } from "@/components/MetaPromptCard";
import { ComposerDock } from "@/components/ComposerDock";
import { AiResponseCard } from "@/components/AiResponseCard";
import { ShowPromptToggle } from "@/components/ShowPromptToggle";
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
import { PRESETS, type Preset } from "@/lib/presets";
import { useAiGeneration, type Message } from "@/hooks/use-ai-generation";

const FEEDBACK_URL = "https://github.com/vivekimsit/textprism/discussions";
const PRESET_HIGHLIGHT_KEYS = {
  channel: true,
  audience: true,
  tone: true,
  persona: true,
};

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
    setChannelRules,
    setOpenaiApiKey,
    setSelectedModel,
    clearOpenaiApiKey,
  } = usePreferences();
  const {
    recents,
    drafts,
    saveDraft,
    promoteRecent,
    clearRecents,
    removeFromRecents,
  } = useHistory();

  // Core state
  const [inputText, setInputText] = useState("");
  const [intent, setIntent] = useState<Intent>(DEFAULT_INTENT);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasEverGenerated, setHasEverGenerated] = useState(false);
  const [hasRequestedGeneration, setHasRequestedGeneration] = useState(false);
  const [generationSeed, setGenerationSeed] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [extraRules, setExtraRules] = useState<string[]>([]);
  // Channel rules: track enabled rule IDs per channel (session state, synced with preferences)
  const [channelRulesState, setChannelRulesState] = useState<Record<string, string[]>>({});
  const [hasUserExpandedMetaPrompt, setHasUserExpandedMetaPrompt] =
    useState(false);
  const [draftsExpanded, setDraftsExpanded] = useState(false);
  const [highlightTokens, setHighlightTokens] = useState<
    Partial<Record<"channel" | "audience" | "tone" | "persona", boolean>>
  >({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const metaPromptRef = useRef<HTMLDivElement>(null);
  const presetApplyingRef = useRef(false);
  const lastExpandedPromotionRef = useRef<string | null>(null);
  const shouldScrollToMetaPromptRef = useRef(false);
  const shouldAutoSendToAiRef = useRef(false);
  
  // Track cursor position for layout transition
  const [savedCursorPosition, setSavedCursorPosition] = useState<{ start: number; end: number } | null>(null);
  
  // Control meta prompt expansion (collapse when sending to AI)
  const [forceCollapseMetaPrompt, setForceCollapseMetaPrompt] = useState(false);
  
  // AI generation hook - uses API key from preferences
  const aiGeneration = useAiGeneration({
    apiKey: preferences.openaiApiKey,
    model: preferences.selectedModel,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize channel rules from preferences when loaded
  useEffect(() => {
    if (isLoaded && Object.keys(channelRulesState).length === 0) {
      setChannelRulesState(preferences.channelRulesEnabled);
    }
  }, [isLoaded, preferences.channelRulesEnabled, channelRulesState]);

  // Get enabled rules for the current channel (from state, preferences, or defaults)
  const currentEnabledRules = useMemo(() => {
    const channel = intent.channel as Platform;
    // First check session state (key exists = user has made a choice, even if empty)
    if (channel in channelRulesState) {
      return channelRulesState[channel];
    }
    // Then check preferences (key exists = user has saved a preference, even if empty)
    if (channel in preferences.channelRulesEnabled) {
      return preferences.channelRulesEnabled[channel];
    }
    // Fall back to defaults only if no explicit choice has been made
    return getDefaultEnabledRules(channel);
  }, [intent.channel, channelRulesState, preferences.channelRulesEnabled]);

  // Build channel rules text from enabled rules
  const channelRulesText = useMemo(() => {
    return buildChannelRulesText(intent.channel as Platform, currentEnabledRules);
  }, [intent.channel, currentEnabledRules]);

  // Handle toggling a channel rule
  const handleRuleToggle = useCallback(
    (ruleId: string, enabled: boolean) => {
      const channel = intent.channel;
      const currentRules = currentEnabledRules;
      
      let newRules: string[];
      if (enabled) {
        newRules = [...currentRules, ruleId];
      } else {
        newRules = currentRules.filter((id) => id !== ruleId);
      }
      
      // Update session state
      setChannelRulesState((prev) => ({
        ...prev,
        [channel]: newRules,
      }));
      
      // Persist to preferences
      setChannelRules(channel, newRules);
    },
    [intent.channel, currentEnabledRules, setChannelRules]
  );

  // Debounce input with 600ms delay for meta prompt generation
  const debouncedInputText = useDebounce(inputText, 600);

  // Derived state
  const hasEnoughText = inputText.trim().length >= THRESHOLD;
  const isGenerating =
    hasRequestedGeneration &&
    inputText.trim() !== debouncedInputText.trim() &&
    hasEnoughText;

  // Generate meta prompt
  const generationInput = useMemo(() => {
    if (!hasRequestedGeneration) return "";
    const debouncedTrimmed = debouncedInputText.trim();
    if (debouncedTrimmed.length >= THRESHOLD) {
      return debouncedTrimmed;
    }
    return generationSeed;
  }, [debouncedInputText, generationSeed, hasRequestedGeneration]);

  const metaPrompt = useMemo(() => {
    if (!canGenerate(generationInput)) return "";

    return generatePrompt({
      message: generationInput.trim(),
      channel: intent.channel as Platform,
      audience: intent.audience ?? "team",
      tone: intent.tone,
      whoIAm: getPersonaLabel(intent.persona),
      extraRules,
      channelRulesText,
    });
  }, [generationInput, intent, extraRules, channelRulesText]);

  const metaPromptStatus = useMemo(() => {
    if (isGenerating) return "generating";
    if (hasEnoughText && metaPrompt.length > 0) return "ready";
    if (inputText.trim().length > 0) return "drafting";
    return "idle";
  }, [hasEnoughText, inputText, isGenerating, metaPrompt]);

  // Track first generation to transition from centered to docked layout
  useEffect(() => {
    if (metaPrompt.length > 0 && !hasEverGenerated && inputText.trim().length) {
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
  }, [metaPrompt, hasEverGenerated, inputText]);

  useEffect(() => {
    if (!hasRequestedGeneration) return;
    if (metaPromptStatus !== "ready") return;
    if (!shouldScrollToMetaPromptRef.current) return;
    const card = metaPromptRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (!isVisible) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    shouldScrollToMetaPromptRef.current = false;
  }, [hasRequestedGeneration, metaPromptStatus]);

  // Auto-send to AI when meta prompt is ready (for direct AI generation flow)
  useEffect(() => {
    if (!shouldAutoSendToAiRef.current) return;
    if (metaPromptStatus !== "ready") return;
    if (!metaPrompt || !preferences.openaiApiKey) return;
    
    // Reset the flag
    shouldAutoSendToAiRef.current = false;
    
    // Reset previous AI response
    aiGeneration.reset();
    
    // Collapse meta prompt card to focus on AI response
    setForceCollapseMetaPrompt(true);
    
    // Build messages array for AI
    const messages: Message[] = [
      {
        role: "user",
        content: metaPrompt,
      },
    ];
    
    // Generate AI response
    aiGeneration.generate(messages);
  }, [metaPromptStatus, metaPrompt, preferences.openaiApiKey, aiGeneration]);

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

  // Determine if AI mode is active (AI response exists or is loading)
  const isAiModeActive = Boolean(
    aiGeneration.response || aiGeneration.isLoading || aiGeneration.error
  );

  const promptContext = useMemo(
    () => ({
      channel: intent.channel,
      audience: intent.audience ?? "team",
      tone: intent.tone,
      role: intent.persona,
    }),
    [intent]
  );

  const getChannelLabelForHistory = (value: string) =>
    CHANNEL_OPTIONS.find((option) => option.value === value)?.label ?? value;

  const getAudienceLabelForHistory = (channelValue: string, value: string) =>
    AUDIENCE_BY_CHANNEL[channelValue]?.find((option) => option.value === value)
      ?.label ?? value;

  const getToneLabelForHistory = (value: string) =>
    TONE_OPTIONS.find((option) => option.value === value)?.label ?? value;

  const promoteCurrent = useCallback(() => {
    const trimmedInput = inputText.trim();
    if (trimmedInput.length < 20) return;
    if (metaPromptStatus !== "ready") return;
    promoteRecent({
      originalText: trimmedInput,
      context: promptContext,
      metaPrompt,
    });
  }, [inputText, metaPrompt, metaPromptStatus, promoteRecent, promptContext]);

  function handleReuse(item: RecentItem) {
    setInputText(item.originalText);
    handleIntentChange({
      channel: item.context.channel as Intent["channel"],
      audience: item.context.audience as Intent["audience"],
      tone: item.context.tone as Intent["tone"],
      persona: item.context.role as Intent["persona"],
    });
  }

  function handleRestoreDraft(item: DraftItem) {
    setInputText(item.originalText);
    handleIntentChange({
      channel: item.context.channel as Intent["channel"],
      audience: item.context.audience as Intent["audience"],
      tone: item.context.tone as Intent["tone"],
      persona: item.context.role as Intent["persona"],
    });
    setDraftsExpanded(false);
  }

  function handleDuplicate(item: RecentItem) {
    promoteRecent({
      originalText: item.originalText,
      context: item.context,
      metaPrompt: item.metaPrompt,
    });
    toast.success("Duplicated!");
  }

  function handleCopyCallback() {
    // Promote when copy is triggered
    promoteCurrent();
  }

  function handleReset() {
    setInputText("");
    setIntent(DEFAULT_INTENT);
    setActivePresetId(null);
    setExtraRules([]);
    setHighlightTokens({});
    setHasRequestedGeneration(false);
    setGenerationSeed("");
    textareaRef.current?.focus();
  }

  function handleClearInput() {
    setInputText("");
    setSavedCursorPosition(null);
    setHasEverGenerated(false);
    setShowSettings(false);
    setShowAdvancedSettings(false);
    setActivePresetId(null);
    setExtraRules([]);
    setHighlightTokens({});
    setHasRequestedGeneration(false);
    setGenerationSeed("");
    shouldScrollToMetaPromptRef.current = false;
    textareaRef.current?.focus();
  }

  function handleIntentChange(nextIntent: Intent) {
    if (!presetApplyingRef.current && activePresetId) {
      setActivePresetId(null);
      setExtraRules([]);
    }
    setIntent(nextIntent);
  }

  function handleGenerateMetaPrompt() {
    const trimmedInput = inputText.trim();
    if (trimmedInput.length < THRESHOLD) return;
    setGenerationSeed(trimmedInput);
    setHasRequestedGeneration(true);
    shouldScrollToMetaPromptRef.current = true;
  }

  function handleSendToAi() {
    if (!metaPrompt || !preferences.openaiApiKey) return;
    
    // Reset previous AI response
    aiGeneration.reset();
    
    // Collapse meta prompt card to focus on AI response
    setForceCollapseMetaPrompt(true);
    
    // Build messages array for AI
    const messages: Message[] = [
      {
        role: "user",
        content: metaPrompt,
      },
    ];
    
    // Generate AI response
    aiGeneration.generate(messages);
  }

  function handleGenerateWithAi() {
    const trimmedInput = inputText.trim();
    if (trimmedInput.length < THRESHOLD) return;
    if (!preferences.openaiApiKey) return;
    
    // First, generate the meta prompt
    setGenerationSeed(trimmedInput);
    setHasRequestedGeneration(true);
    
    // Reset previous AI response
    aiGeneration.reset();
    
    // Mark that we want to auto-send to AI once meta prompt is ready
    // We'll use a ref to track this intent
    shouldAutoSendToAiRef.current = true;
  }

  function handleApiKeyClear() {
    clearOpenaiApiKey();
    aiGeneration.reset();
  }

  function buildPresetTags(preset: Preset) {
    const channelLabel = getChannelLabel(preset.context.channel);
    const audienceLabel = getAudienceLabel(preset.context.audience);
    const toneLabel = getToneLabel(preset.context.tone);
    const roleLabel = getPersonaLabel(preset.context.role);
    return `${channelLabel} · ${audienceLabel} · ${toneLabel} · ${roleLabel}`;
  }

  function handleApplyPreset(preset: Preset) {
    presetApplyingRef.current = true;
    const wasEmpty = inputText.trim().length === 0;
    setIntent({
      channel: preset.context.channel,
      audience: preset.context.audience,
      tone: preset.context.tone,
      persona: preset.context.role,
    });
    setExtraRules(preset.extraRules ?? []);
    setActivePresetId(preset.id);
    setHighlightTokens({ ...PRESET_HIGHLIGHT_KEYS });
    if (wasEmpty) {
      setInputText(preset.sentence);
    }
    toast.success(`Preset applied: ${buildPresetTags(preset)}`);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  useEffect(() => {
    if (presetApplyingRef.current) {
      presetApplyingRef.current = false;
      return;
    }
    if (activePresetId) {
      setActivePresetId(null);
      setExtraRules([]);
    }
  }, [intent.channel, intent.audience, intent.tone, intent.persona]);

  useEffect(() => {
    if (!Object.values(highlightTokens).some(Boolean)) return;
    const timeout = window.setTimeout(() => {
      setHighlightTokens({});
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [highlightTokens]);

  useEffect(() => {
    const trimmedInput = debouncedInputText.trim();
    if (trimmedInput.length < 20) return;
    if (!hasRequestedGeneration) return;
    saveDraft({
      originalText: trimmedInput,
      context: promptContext,
      metaPrompt,
    });
  }, [debouncedInputText, hasRequestedGeneration, metaPrompt, promptContext, saveDraft]);

  useEffect(() => {
    if (!hasUserExpandedMetaPrompt) return;
    if (metaPromptStatus !== "ready") return;
    const trimmedInput = inputText.trim();
    if (trimmedInput.length < 20) return;
    const signature = [
      promptContext.channel,
      promptContext.audience,
      promptContext.tone,
      promptContext.role,
      trimmedInput,
    ].join("|");
    if (lastExpandedPromotionRef.current === signature) return;

    const timeout = window.setTimeout(() => {
      if (metaPromptStatus !== "ready") return;
      promoteCurrent();
      lastExpandedPromotionRef.current = signature;
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [
    hasUserExpandedMetaPrompt,
    inputText,
    metaPromptStatus,
    promptContext,
    promoteCurrent,
  ]);

  const normalizedSidebarSearch = sidebarSearch.trim().toLowerCase();
  const filteredRecents = useMemo(() => {
    if (!normalizedSidebarSearch) return recents;
    return recents.filter((item) => {
      const channelLabel = getChannelLabelForHistory(item.context.channel);
      const audienceLabel = getAudienceLabelForHistory(
        item.context.channel,
        item.context.audience
      );
      const toneLabel = getToneLabelForHistory(item.context.tone);
      const haystack = [
        item.originalText,
        item.metaPrompt,
        channelLabel,
        audienceLabel,
        toneLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSidebarSearch);
    });
  }, [recents, normalizedSidebarSearch]);

  const showSidebar = recents.length > 0 || drafts.length > 0;

  function handleInputBlur() {
    if (metaPromptStatus !== "ready") return;
    promoteCurrent();
  }

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  onClick={handleClearInput}
                  title="New prompt"
                  aria-label="New prompt"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  onClick={clearRecents}
                  title="Clear history"
                  aria-label="Clear history"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
                <div className="px-1 pb-2">
                  <Input
                    value={sidebarSearch}
                    onChange={(event) => setSidebarSearch(event.target.value)}
                    placeholder="Search prompts..."
                    className="h-8 text-xs"
                    aria-label="Search prompts"
                  />
                </div>
                {filteredRecents.length > 0 ? (
                  <div className="space-y-1">
                    {filteredRecents.map((item) => {
                      const channelLabel = getChannelLabelForHistory(
                        item.context.channel
                      );
                      const audienceLabel = getAudienceLabelForHistory(
                        item.context.channel,
                        item.context.audience
                      );
                      const toneLabel = getToneLabelForHistory(
                        item.context.tone
                      );
                      const titleLine =
                        item.originalText.split(/\r?\n/)[0] || "Untitled";

                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-muted/60 transition-colors group cursor-pointer"
                          onClick={() => handleReuse(item)}
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-sm text-foreground line-clamp-2 whitespace-pre-wrap">
                              {titleLine}
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
                                removeFromRecents(item.id);
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
                    {recents.length > 0
                      ? "No prompts match your search."
                      : "Recent prompts appear here after you use them."}
                  </p>
                )}
                {drafts.length > 0 ? (
                  <div className="mt-3 px-1">
                    <button
                      type="button"
                      onClick={() => setDraftsExpanded((prev) => !prev)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      aria-expanded={draftsExpanded}
                    >
                      {draftsExpanded ? "Hide" : "Show"} drafts (
                      {Math.min(drafts.length, 5)})
                    </button>
                    <div
                      className={cn(
                        "mt-2 overflow-hidden transition-[max-height,opacity] duration-200",
                        draftsExpanded
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0 pointer-events-none"
                      )}
                    >
                      <div className="space-y-1">
                        {drafts.slice(0, 5).map((item) => {
                          const channelLabel = getChannelLabelForHistory(
                            item.context.channel
                          );
                          const audienceLabel = getAudienceLabelForHistory(
                            item.context.channel,
                            item.context.audience
                          );
                          const toneLabel = getToneLabelForHistory(
                            item.context.tone
                          );
                          const titleLine =
                            item.originalText.split(/\r?\n/)[0] || "Untitled";

                          return (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                              onClick={() => handleRestoreDraft(item)}
                            >
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <p className="text-xs text-foreground line-clamp-2 whitespace-pre-wrap">
                                  {titleLine}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {channelLabel} · {audienceLabel} · {toneLabel}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
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

                {/* AI Generation Settings */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <p className="text-sm font-medium">AI Generation</p>
                  <p className="text-xs text-muted-foreground">
                    Add your OpenAI API key to generate messages directly
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs text-muted-foreground">
                        OpenAI API Key
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={preferences.openaiApiKey}
                          onChange={(e) => setOpenaiApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="h-9 flex-1"
                        />
                        {preferences.openaiApiKey && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleApiKeyClear}
                            className="h-9 px-3"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Stored locally in your browser. Never sent to our servers.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        Model
                      </label>
                      <Select
                        value={preferences.selectedModel}
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {!preferences.openaiApiKey && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Get your API key from OpenAI
                    </a>
                  )}
                </div>
              </div>
            ) : null}

            {/* AI Response Card - primary output when AI mode is active */}
            {isAiModeActive && (
              <AiResponseCard
                className="mt-auto pt-4"
                response={aiGeneration.response}
                isLoading={aiGeneration.isLoading}
                error={aiGeneration.error}
                onRegenerate={handleSendToAi}
                channel={intent.channel as Platform}
                enabledRuleIds={currentEnabledRules}
                onRuleToggle={handleRuleToggle}
              />
            )}

            {/* Show Prompt Toggle - minimal view when AI mode is active */}
            {isAiModeActive && metaPrompt && (
              <ShowPromptToggle
                key={`prompt-${metaPrompt.substring(0, 50)}`}
                className="mt-4"
                metaPrompt={metaPrompt}
                intentSummary={intentSummary}
              />
            )}

            {/* Meta Prompt Card - full view when AI mode is NOT active */}
            {!isAiModeActive && (
              <div ref={metaPromptRef}>
                <MetaPromptCard
                  className="mt-auto pt-4"
                  metaPrompt={metaPrompt}
                  isGenerating={isGenerating}
                  hasEnoughText={hasEnoughText}
                  intentSummary={intentSummary}
                  channel={intent.channel as Platform}
                  enabledRuleIds={currentEnabledRules}
                  onRuleToggle={handleRuleToggle}
                  onCopy={handleCopyCallback}
                  onExpand={() => {
                    setHasUserExpandedMetaPrompt(true);
                    setForceCollapseMetaPrompt(false); // Reset force collapse when user expands
                  }}
                  hasApiKey={preferences.openaiApiKey.length > 0}
                  onSendToAi={handleSendToAi}
                  isAiLoading={aiGeneration.isLoading}
                  forceCollapsed={forceCollapseMetaPrompt}
                />
              </div>
            )}
              </div>
            </div>

            {/* Sticky Composer Dock at bottom */}
            <ComposerDock
              ref={textareaRef}
              value={inputText}
              onChange={setInputText}
              onInputBlur={handleInputBlur}
              threshold={THRESHOLD}
              intent={intent}
              onIntentChange={handleIntentChange}
              presets={PRESETS}
              onApplyPreset={handleApplyPreset}
              activePresetId={activePresetId}
              highlightTokens={highlightTokens}
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
              onInputBlur={handleInputBlur}
              onGenerate={handleGenerateMetaPrompt}
              threshold={THRESHOLD}
              intent={intent}
              onIntentChange={handleIntentChange}
              presets={PRESETS}
              onApplyPreset={handleApplyPreset}
              activePresetId={activePresetId}
              highlightTokens={highlightTokens}
              centered
              isGenerating={isGenerating}
              hasContent={metaPrompt.length > 0}
              showGenerateCTA
              hasApiKey={preferences.openaiApiKey.length > 0}
              onGenerateWithAi={handleGenerateWithAi}
            />

            {/* Theme toggle and settings in corner */}
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

            {/* Settings Panel - Fixed position for centered layout */}
            {showSettings && (
              <div className="fixed top-16 right-4 w-96 max-h-[80vh] overflow-y-auto p-4 border rounded-2xl bg-card shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Settings</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* AI Generation Settings */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">AI Generation</p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        OpenAI API Key
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={preferences.openaiApiKey}
                          onChange={(e) => setOpenaiApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="h-9 flex-1"
                        />
                        {preferences.openaiApiKey && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleApiKeyClear}
                            className="h-9 px-3"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Stored locally. Never sent to our servers.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Model</label>
                      <Select
                        value={preferences.selectedModel}
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {!preferences.openaiApiKey && (
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Get your API key from OpenAI
                      </a>
                    )}
                  </div>
                </div>

                {/* Defaults */}
                <div className="space-y-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Defaults</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Who I am</label>
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
                      <label className="text-xs text-muted-foreground">Default Tone</label>
                      <Select value={preferences.defaultTone} onValueChange={setDefaultTone}>
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
                </div>
              </div>
            )}
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
