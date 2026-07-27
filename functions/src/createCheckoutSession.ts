import * as functions from 'firebase-functions/v2/https';
import { admin } from './admin';
import { getStripe, getPriceId, STRIPE_SECRET_KEY, STRIPE_PRICE_ID } from './stripe';
import { SITE_URL } from './params';
import { HttpsError } from 'firebase-functions/v2/https';

export const createCheckoutSession = functions.onCall(
  {
    region: 'europe-west1',
    secrets: [STRIPE_SECRET_KEY, STRIPE_PRICE_ID],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Vous devez être connecté pour souscrire.'
      );
    }

    const userId = request.auth.uid;
    const stripe = getStripe();
    const PRICE_ID = getPriceId();

    const subDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('subscription')
      .doc('main')
      .get();

    let customerId = subDoc.exists ? subDoc.data()?.stripeCustomerId : null;

    if (!customerId) {
      const user = await admin.auth().getUser(userId);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;

      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('subscription')
        .doc('main')
        .set({
          plan: 'free',
          status: null,
          stripeCustomerId: customerId,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
    }

    const siteUrl = SITE_URL.value();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${siteUrl}/app?checkout=success`,
      cancel_url: `${siteUrl}/tarifs`,
      metadata: { userId },
    });

    return { url: session.url };
  });
