import Stripe from 'stripe';

let _stripe: Stripe | null = null;
let _priceId: string | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    });
  }
  return _stripe;
}

export function getPriceId(): string {
  if (!_priceId) {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID environment variable is required');
    }
    _priceId = priceId;
  }
  return _priceId;
}