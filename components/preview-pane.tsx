'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Intent } from '@/lib/intent-matrix';

interface PreviewPaneProps {
  intent: Intent | null;
  prompt: string;
  isProLocked: boolean;
}

export function PreviewPane({ intent, prompt, isProLocked }: PreviewPaneProps) {
  if (!intent) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your generated prompt will appear here once you fill in the form.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Prompt</CardTitle>
          {intent.tier === 'pro' && (
            <Badge variant="default">PRO</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre
            className={`rounded-lg bg-muted p-4 text-sm overflow-x-auto font-mono whitespace-pre-wrap ${
              isProLocked ? 'filter blur-[5px] select-none' : ''
            }`}
          >
            {prompt || 'Fill in the form fields to generate your prompt...'}
          </pre>
          
          {isProLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Pro Feature</p>
                <p className="text-sm text-muted-foreground">
                  Unlock this prompt with Pro
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
