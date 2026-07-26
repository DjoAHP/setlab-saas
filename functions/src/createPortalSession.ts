import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { stripe } from './stripe';
import { HttpsError } from 'firebase-functions/v2/https';

const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

export const createPortalSession = functions.onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Vous devez être connecté.'
    );
  }

  const userId = request.auth.uid;

  const subDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('subscription')
    .doc('main')
    .get();

  if (!subDoc.exists) {
    throw new HttpsError(
      'not-found',
      'Aucun abonnement trouvé.'
    );
  }

  const customerId = subDoc.data()?.stripeCustomerId;
  if (!customerId) {
    throw new HttpsError(
      'not-found',
      'Aucun client Stripe trouvé.'
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${SITE_URL}/app`,
  });

  return { url: session.url };
});