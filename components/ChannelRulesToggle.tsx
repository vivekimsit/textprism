"use client";

import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { CHANNEL_RULES, type ChannelRule } from "@/lib/channel-rules";
import type { Platform } from "@/lib/generate-prompt";
import { Check } from "lucide-react";

interface ChannelRulesToggleProps {
  channel: Platform;
  enabledRuleIds: string[];
  onToggle: (ruleId: string, enabled: boolean) => void;
  className?: string;
}

export function ChannelRulesToggle({
  channel,
  enabledRuleIds,
  onToggle,
  className,
}: ChannelRulesToggleProps) {
  const rules = CHANNEL_RULES[channel];

  if (!rules || rules.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Channel rules ({channel}):
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {rules.map((rule: ChannelRule) => {
          const isEnabled = enabledRuleIds.includes(rule.id);
          return (
            <Toggle
              key={rule.id}
              variant="outline"
              size="sm"
              pressed={isEnabled}
              onPressedChange={(pressed) => onToggle(rule.id, pressed)}
              aria-label={`Toggle ${rule.label}`}
              className={cn(
                "h-7 px-2.5 text-xs font-normal rounded-full transition-all",
                "border data-[state=on]:bg-foreground data-[state=on]:text-background",
                "data-[state=on]:border-foreground",
                "data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground",
                "data-[state=off]:border-border/60 data-[state=off]:hover:border-border",
                "data-[state=off]:hover:text-foreground"
              )}
            >
              {isEnabled && <Check className="h-3 w-3 mr-1" />}
              {rule.label}
            </Toggle>
          );
        })}
      </div>
    </div>
  );
}
