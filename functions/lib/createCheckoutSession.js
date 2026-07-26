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
exports.createCheckoutSession = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = require("./stripe");
const https_1 = require("firebase-functions/v2/https");
admin.initializeApp();
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
exports.createCheckoutSession = functions.onCall(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Vous devez être connecté pour souscrire.');
    }
    const userId = request.auth.uid;
    const stripe = (0, stripe_1.getStripe)();
    const PRICE_ID = (0, stripe_1.getPriceId)();
    const subDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('subscription')
        .doc('main')
        .get();
    let customerId = subDoc.exists ? (_a = subDoc.data()) === null || _a === void 0 ? void 0 : _a.stripeCustomerId : null;
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
//# sourceMappingURL=createCheckoutSession.js.map