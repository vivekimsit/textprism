"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ExternalLink, X, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

// Validate OpenAI API key format
function isValidKeyFormat(key: string): boolean {
  return /^sk-[a-zA-Z0-9-_]{32,}$/.test(key);
}

export function ApiKeyInput({
  value,
  onChange,
  onClear,
  className,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const hasKey = value.length > 0;
  const isValid = hasKey && isValidKeyFormat(value);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input Section */}
      <div className="space-y-2">
        <Label htmlFor="api-key" className="text-sm font-medium">
          OpenAI API Key
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="sk-..."
              className={cn(
                "pr-10",
                hasKey &&
                  !isValid &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              aria-label="OpenAI API Key"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowKey(!showKey)}
              tabIndex={-1}
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {hasKey && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="shrink-0"
              title="Clear API key"
              aria-label="Clear API key"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {hasKey && !isValid && (
          <p className="text-xs text-destructive">
            Invalid key format. Should start with sk- followed by 32+
            characters.
          </p>
        )}
      </div>

      {/* Trust Messaging */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Key className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Your API key stays private
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Stored only in your browser&apos;s memory (cleared on refresh)
              </li>
              <li>Sent directly to OpenAI via our secure proxy</li>
              <li>Never logged, stored, or visible to us</li>
            </ul>
          </div>
        </div>
        <div className="pt-1 border-t border-border/30">
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <span>Get your API key from OpenAI</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Optional: Recommendation */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">💡 Recommended:</p>
        <ul className="space-y-0.5 list-disc list-inside pl-1">
          <li>Create a dedicated API key just for TextPrism</li>
          <li>Set a spending limit in your OpenAI dashboard</li>
        </ul>
      </div>
    </div>
  );
}
