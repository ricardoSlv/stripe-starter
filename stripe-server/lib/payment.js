"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
const index_1 = require("index");
async function createPaymentIntent(amount) {
    const paymentIntent = await index_1.stripe.paymentIntents.create({
        amount,
        currency: 'usd'
    });
    return paymentIntent;
}
exports.createPaymentIntent = createPaymentIntent;
//# sourceMappingURL=payment.js.map