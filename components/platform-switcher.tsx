'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INTENT_MATRIX, type Platform, type Intent } from '@/lib/intent-matrix';

interface PlatformSwitcherProps {
  selectedPlatform: Platform;
  selectedIntentId: string | null;
  onPlatformChange: (platform: Platform) => void;
  onIntentSelect: (intentId: string) => void;
}

export function PlatformSwitcher({
  selectedPlatform,
  selectedIntentId,
  onPlatformChange,
  onIntentSelect,
}: PlatformSwitcherProps) {
  const platforms: { id: Platform; label: string; description: string }[] = [
    { id: 'slack', label: 'Work (Slack)', description: 'Team updates and collaboration' },
    { id: 'email', label: 'Work (Email)', description: 'Professional correspondence' },
    { id: 'linkedin', label: 'LinkedIn', description: 'Professional networking' },
    { id: 'reddit', label: 'Reddit', description: 'Developer communities' },
    { id: 'quora', label: 'Quora', description: 'Knowledge sharing' },
  ];

  const getIntentsForPlatform = (platform: Platform): Intent[] => {
    return INTENT_MATRIX.filter(intent => intent.platform === platform);
  };

  return (
    <Tabs
      value={selectedPlatform}
      onValueChange={(value) => onPlatformChange(value as Platform)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-5">
        {platforms.map(platform => (
          <TabsTrigger key={platform.id} value={platform.id}>
            {platform.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {platforms.map(platform => {
        const intents = getIntentsForPlatform(platform.id);
        return (
          <TabsContent key={platform.id} value={platform.id} className="mt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {platform.label}
                </h2>
                <p className="text-muted-foreground">{platform.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {intents.map(intent => (
                  <Card
                    key={intent.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedIntentId === intent.id
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => onIntentSelect(intent.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{intent.name}</CardTitle>
                        <Badge variant={intent.tier === 'pro' ? 'default' : 'secondary'}>
                          {intent.tier === 'pro' ? 'PRO' : 'FREE'}
                        </Badge>
                      </div>
                      <CardDescription>{intent.outcomeLabel}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
