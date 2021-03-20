"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebHook = void 0;
const index_1 = require("index");
const webhookHandlers = {
    'payment_intent.succeeded': async (data) => { },
    'payment_intent.payment_failed': async (data) => { },
    'payment_intent.created': async (data) => { },
    'charge.succeeded': async (data) => { }
};
exports.handleStripeWebHook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = index_1.stripe.webhooks.constructEvent(req['rawBody'], sig, process.env.STRIPE_WEBHOOK_SECRET);
    try {
        console.log('event.type :>> ', event.type);
        await webhookHandlers[event.type](event.data.object);
        res.send({ received: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
//# sourceMappingURL=webhooks.js.map