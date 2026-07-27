import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';

let _stripe: Stripe | null = null;
let _priceId: string | null = null;

export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
export const STRIPE_PRICE_ID = defineSecret('STRIPE_PRICE_ID');

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = STRIPE_SECRET_KEY.value();
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY secret is not configured');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    });
  }
  return _stripe;
}

export function getPriceId(): string {
  if (!_priceId) {
    const priceId = STRIPE_PRICE_ID.value();
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID secret is not configured');
    }
    _priceId = priceId;
  }
  return _priceId;
}
