import { loadStripe } from '@stripe/stripe-js';
import type StripePackage from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? '';
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

if (typeof window === 'undefined' && !stripeSecretKey && process.env.NODE_ENV !== 'production') {
  console.warn('[stripe] STRIPE_SECRET_KEY no está configurada');
}

if (typeof window !== 'undefined' && !stripePublishableKey && process.env.NODE_ENV !== 'production') {
  console.warn('[stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada');
}

let stripeServer: StripePackage | null = null;

if (typeof window === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require('stripe') as typeof import('stripe').default;
  stripeServer = new Stripe(stripeSecretKey, {
    apiVersion: '2024-04-10',
  });
}

export const stripe = stripeServer as StripePackage;

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
  if (!stripePromise && typeof window !== 'undefined') {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};
