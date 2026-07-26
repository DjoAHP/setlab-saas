"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripe = getStripe;
exports.getPriceId = getPriceId;
const stripe_1 = __importDefault(require("stripe"));
let _stripe = null;
let _priceId = null;
function getStripe() {
    if (!_stripe) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY environment variable is required');
        }
        _stripe = new stripe_1.default(secretKey, {
            apiVersion: '2024-06-20',
        });
    }
    return _stripe;
}
function getPriceId() {
    if (!_priceId) {
        _priceId = process.env.STRIPE_PRICE_ID || 'price_1TxSUYFFY7OiGi5kAC3jQRoN';
    }
    return _priceId;
}
//# sourceMappingURL=stripe.js.map