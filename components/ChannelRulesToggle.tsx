"use client";

import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { CHANNEL_RULES, type ChannelRule } from "@/lib/channel-rules";
import type { Platform } from "@/lib/generate-prompt";
import {
  Code,
  List,
  Eye,
  Smile,
  MessageSquare,
  Mail,
  LayoutList,
  HandMetal,
  Minimize2,
  Briefcase,
  Sparkles,
  AlignJustify,
  MousePointerClick,
  Hash,
  Ruler,
  MessageCircle,
  CaseLower,
  SmilePlus,
  User,
  FileText,
  Lightbulb,
  BookOpen,
  Heading,
  BookMarked,
  type LucideIcon,
} from "lucide-react";

// Map icon names to components
const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  List,
  Eye,
  Smile,
  MessageSquare,
  Mail,
  LayoutList,
  HandMetal,
  Minimize2,
  Briefcase,
  Sparkles,
  AlignJustify,
  MousePointerClick,
  Hash,
  Ruler,
  MessageCircle,
  CaseLower,
  SmilePlus,
  User,
  FileText,
  Lightbulb,
  BookOpen,
  Heading,
  BookMarked,
};

interface ChannelRulesToggleProps {
  channel: Platform;
  enabledRuleIds: string[];
  onToggle: (ruleId: string, enabled: boolean) => void;
  className?: string;
  /** Compact mode - icons only with tooltips */
  compact?: boolean;
}

export function ChannelRulesToggle({
  channel,
  enabledRuleIds,
  onToggle,
  className,
  compact = false,
}: ChannelRulesToggleProps) {
  const rules = CHANNEL_RULES[channel];

  if (!rules || rules.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {rules.map((rule: ChannelRule) => {
        const isEnabled = enabledRuleIds.includes(rule.id);
        const IconComponent = ICON_MAP[rule.icon];

        return (
          <Toggle
            key={rule.id}
            variant="outline"
            size="sm"
            pressed={isEnabled}
            onPressedChange={(pressed) => onToggle(rule.id, pressed)}
            aria-label={rule.label}
            title={rule.label}
            className={cn(
              "transition-all",
              compact
                ? "h-8 w-8 p-0 rounded-md"
                : "h-7 px-2 text-xs font-normal rounded-md gap-1.5",
              "border data-[state=on]:bg-foreground data-[state=on]:text-background",
              "data-[state=on]:border-foreground",
              "data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground",
              "data-[state=off]:border-border/60 data-[state=off]:hover:border-border",
              "data-[state=off]:hover:text-foreground"
            )}
          >
            {IconComponent && (
              <IconComponent
                className={cn(compact ? "h-4 w-4" : "h-3.5 w-3.5")}
              />
            )}
            {!compact && <span>{rule.label}</span>}
          </Toggle>
        );
      })}
    </div>
  );
}
