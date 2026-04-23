import Stripe from 'stripe';

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && key.startsWith('sk_') && key !== 'your_stripe_secret_key';
}

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  cached = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
  });
  return cached;
}
