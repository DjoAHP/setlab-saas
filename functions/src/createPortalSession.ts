import * as functions from 'firebase-functions/v2/https';
import { admin } from './admin';
import { getStripe, STRIPE_SECRET_KEY } from './stripe';
import { SITE_URL } from './params';
import { HttpsError } from 'firebase-functions/v2/https';

export const createPortalSession = functions.onCall(
  {
    region: 'europe-west1',
    secrets: [STRIPE_SECRET_KEY],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Vous devez être connecté.'
      );
    }

    const userId = request.auth.uid;
    const stripe = getStripe();

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

    const siteUrl = SITE_URL.value();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/app`,
    });

    return { url: session.url };
  });
