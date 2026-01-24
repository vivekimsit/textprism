'use client';

import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { getCheckoutUrl } from '@/lib/paywall';

interface ProUnlockButtonProps {
  onUnlock?: () => void;
}

export function ProUnlockButton({ onUnlock }: ProUnlockButtonProps) {
  const handleClick = () => {
    // In MVP, we'll just unlock for demo purposes
    // In production, this would redirect to Stripe/LemonSqueezy
    if (onUnlock) {
      onUnlock();
    } else {
      // Redirect to checkout
      const checkoutUrl = getCheckoutUrl();
      window.open(checkoutUrl, '_blank');
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="w-full"
    >
      <Lock className="mr-2 h-4 w-4" />
      Unlock with Pro
    </Button>
  );
}
