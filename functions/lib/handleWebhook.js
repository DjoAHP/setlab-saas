"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = require("./stripe");
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
exports.handleStripeWebhook = functions.onRequest(async (req, res) => {
    var _a;
    if (!WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        res.status(500).send('Webhook secret not configured');
        return;
    }
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = (0, stripe_1.getStripe)().webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
    }
    catch (err) {
        console.error('Webhook signature verification failed.', err);
        res.status(400).send('Webhook signature verification failed.');
        return;
    }
    const db = admin.firestore();
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId) || session.client_reference_id;
            if (!userId) {
                console.error('No userId found in session', session.id);
                break;
            }
            const subscriptionId = session.subscription;
            const subscription = await (0, stripe_1.getStripe)().subscriptions.retrieve(subscriptionId);
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
            const customerId = subscription.customer;
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
            const customerId = deletedSub.customer;
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
//# sourceMappingURL=handleWebhook.js.map