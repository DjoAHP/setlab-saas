import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { stripe, PRICE_ID } from './stripe';
import { HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();

const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

export const createCheckoutSession = functions.onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Vous devez être connecté pour souscrire.'
    );
  }

  const userId = request.auth.uid;

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

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${SITE_URL}/app?checkout=success`,
    cancel_url: `${SITE_URL}/tarifs`,
    metadata: { userId },
  });

  return { url: session.url };
});