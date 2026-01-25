"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Copy,
  Check,
  ChevronDown,
  Settings,
  Trash2,
  X,
  Sun,
  Moon,
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
} from "@/hooks/use-preferences";
import { useHistory, formatRelativeTime } from "@/hooks/use-history";
import {
  generatePrompt,
  canGenerate,
  type Platform,
} from "@/lib/generate-prompt";

function HomeContent() {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { preferences, isLoaded, setWhoIAm, setDefaultTone } = usePreferences();
  const { history, addToHistory, clearHistory } = useHistory();

  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<Platform>("slack");
  const [audience, setAudience] = useState(DEFAULT_AUDIENCE["slack"]);
  const [tone, setTone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update audience when channel changes
  useEffect(() => {
    setAudience(DEFAULT_AUDIENCE[channel]);
  }, [channel]);

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

  const handleCopy = async () => {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success("Copied!", { description: "Paste into your AI tool" });

      addToHistory({
        channel,
        audience,
        tone: effectiveTone,
        inputPreview:
          message.trim().slice(0, 60) + (message.length > 60 ? "..." : ""),
        prompt: generatedPrompt,
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const showPreview = canGenerate(message) && generatedPrompt;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-4">
        {/* Settings toggle - top right */}
        <div className="flex justify-end px-1 gap-2">
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
          </div>
        )}

        {/* Main Input Card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          {/* Textarea */}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What do you want to say?"
            className="min-h-[100px] text-base resize-none border-0 shadow-none focus-visible:ring-0 rounded-none p-4 placeholder:text-muted-foreground/50"
            autoFocus
          />

          {/* Controls row - Channels left, Tone right */}
          <div className="px-4 pb-3 pt-2 flex items-center justify-between border-t border-border/40">
            {/* Left: Channel pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CHANNEL_OPTIONS.map((ch) => (
                <button
                  key={ch.value}
                  onClick={() => setChannel(ch.value)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${
                      channel === ch.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Right: Current tone pill */}
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

          {/* Audience row - only if multiple options */}
          {audienceOptions.length > 1 && (
            <div className="px-4 pb-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">To:</span>
              {audienceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAudience(opt.value)}
                  className={`
                    px-2.5 py-1 rounded-full text-xs transition-all
                    ${
                      audience === opt.value
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview & Copy */}
        {showPreview && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative">
              <pre className="text-xs bg-muted/30 rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground max-h-[180px] overflow-y-auto border">
                {generatedPrompt}
              </pre>
            </div>

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
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${historyOpen ? "rotate-180" : ""}`}
                />
                Recent ({history.length})
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.inputPreview}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.channel} · {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={async () => {
                      await navigator.clipboard.writeText(item.prompt);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-destructive"
                onClick={clearHistory}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear history
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Footer branding */}
        <div className="flex justify-center pt-4">
          <Logo className="text-xs text-muted-foreground/50" />
        </div>
      </div>
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
