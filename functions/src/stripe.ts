import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_1TxSUYFFY7OiGi5kAC3jQRoN';