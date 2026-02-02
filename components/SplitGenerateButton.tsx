"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SplitGenerateButtonProps {
  onGenerateWithAi: () => void;
  onGenerateMetaPrompt: () => void;
  disabled?: boolean;
  className?: string;
}

export function SplitGenerateButton({
  onGenerateWithAi,
  onGenerateMetaPrompt,
  disabled = false,
  className,
}: SplitGenerateButtonProps) {
  const [open, setOpen] = useState(false);

  function handleMetaPromptClick() {
    onGenerateMetaPrompt();
    setOpen(false);
  }

  return (
    <div className={cn("flex items-center", className)}>
      {/* Primary action - Generate with AI */}
      <Button
        onClick={onGenerateWithAi}
        disabled={disabled}
        className="rounded-r-none border-r-0"
        size="default"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate with AI
      </Button>

      {/* Dropdown trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            disabled={disabled}
            className="rounded-l-none px-2 border-l border-l-background/20"
            size="default"
            aria-label="More generation options"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-52 p-1">
          <button
            onClick={handleMetaPromptClick}
            disabled={disabled}
            className={cn(
              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
              "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            <div className="font-medium">Generate meta prompt</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Copy prompt to use with any AI
            </div>
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
