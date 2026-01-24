'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

export function CopyButton({ text, disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disabled || !text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!', {
        description: 'Paste this prompt into your favorite AI tool.',
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy', {
        description: 'Please try again or copy manually.',
      });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled || !text}
      size="lg"
      className="w-full"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copy Prompt
        </>
      )}
    </Button>
  );
}
