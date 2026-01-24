'use client';

import { Suspense, useMemo } from 'react';
import { PlatformSwitcher } from '@/components/platform-switcher';
import { DynamicForm } from '@/components/dynamic-form';
import { PreviewPane } from '@/components/preview-pane';
import { CopyButton } from '@/components/copy-button';
import { ProUnlockButton } from '@/components/pro-unlock-button';
import { useFormState } from '@/hooks/use-form-state';
import { getIntentById } from '@/lib/intent-matrix';
import { generatePrompt, isPromptReady, getPreviewPlaceholder } from '@/lib/generate-prompt';
import { isProLocked } from '@/lib/paywall';

function HomeContent() {
  const {
    platform,
    intentId,
    role,
    vibe,
    fieldValues,
    isProUnlocked,
    setPlatform,
    setIntentId,
    setRole,
    setVibe,
    setFieldValues,
    unlockPro,
  } = useFormState();

  const selectedIntent = intentId ? getIntentById(intentId) ?? null : null;
  const locked = isProLocked(selectedIntent, isProUnlocked);

  // Generate prompt
  const generatedPrompt = useMemo(() => {
    if (!selectedIntent) return '';
    
    if (!isPromptReady(selectedIntent, fieldValues)) {
      return getPreviewPlaceholder(selectedIntent);
    }

    return generatePrompt({
      role,
      intent: selectedIntent,
      platform,
      vibe,
      fieldValues,
    });
  }, [selectedIntent, role, platform, vibe, fieldValues]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              The Liaison
            </h1>
            <p className="text-muted-foreground">
              The Bridge Between Your Thoughts and AI&apos;s Best Output
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Platform Switcher */}
        <div className="mb-8">
          <PlatformSwitcher
            selectedPlatform={platform}
            selectedIntentId={intentId}
            onPlatformChange={setPlatform}
            onIntentSelect={setIntentId}
          />
        </div>

        {/* Form and Preview */}
        {selectedIntent && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Form */}
            <div>
              <DynamicForm
                intent={selectedIntent}
                role={role}
                vibe={vibe}
                fieldValues={fieldValues}
                onRoleChange={setRole}
                onVibeChange={setVibe}
                onFieldChange={setFieldValues}
              />
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <PreviewPane
                intent={selectedIntent}
                prompt={generatedPrompt}
                isProLocked={locked}
              />

              {/* Action Button */}
              <div className="sticky bottom-4">
                {locked ? (
                  <ProUnlockButton onUnlock={unlockPro} />
                ) : (
                  <CopyButton
                    text={generatedPrompt}
                    disabled={!isPromptReady(selectedIntent, fieldValues)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for developers who want better AI outputs.</p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
