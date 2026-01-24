import type { Intent } from './intent-matrix';

export const STRIPE_CHECKOUT_URL = process.env.NEXT_PUBLIC_STRIPE_URL || 'https://buy.stripe.com/placeholder';
export const LEMONSQUEEZY_CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL || 'https://lemonsqueezy.com/checkout/placeholder';

export function isProIntent(intent: Intent | null): boolean {
  return intent?.tier === 'pro';
}

export function isProLocked(intent: Intent | null, isProUnlocked: boolean): boolean {
  return isProIntent(intent) && !isProUnlocked;
}

export function getCheckoutUrl(): string {
  // Prefer LemonSqueezy if configured, otherwise use Stripe
  return process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL || 
         process.env.NEXT_PUBLIC_STRIPE_URL || 
         LEMONSQUEEZY_CHECKOUT_URL;
}
