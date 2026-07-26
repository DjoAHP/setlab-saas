import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { getStripe } from './stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const handleStripeWebhook = functions.onRequest({ cors: true, region: 'europe-west1' }, async (req, res) => {
  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    res.status(400).send('Webhook signature verification failed.');
    return;
  }

  const db = admin.firestore();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId || session.client_reference_id;
      if (!userId) {
        console.error('No userId found in session', session.id);
        break;
      }

      const subscriptionId = session.subscription as string;
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

      await db
        .collection('users')
        .doc(userId)
        .collection('subscription')
        .doc('main')
        .set({
          plan: 'unlimited',
          status: subscription.status,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const snapshot = await db
        .collectionGroup('subscription')
        .where('stripeCustomerId', '==', customerId)
        .get();

      for (const doc of snapshot.docs) {
        await doc.ref.set({
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const deletedSub = event.data.object;
      const customerId = deletedSub.customer as string;

      const snapshot = await db
        .collectionGroup('subscription')
        .where('stripeCustomerId', '==', customerId)
        .get();

      for (const doc of snapshot.docs) {
        await doc.ref.set({
          plan: 'free',
          status: 'canceled',
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send('OK');
});