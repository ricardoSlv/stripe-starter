"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebHook = void 0;
const index_1 = require("index");
const firebaseApp_1 = require("firebaseApp");
const firebase_admin_1 = require("firebase-admin");
const webhookHandlers = {
    'customer.created': async (data) => { },
    'setup_intent.created': async (data) => { },
    'checkout.session.completed': async (data) => { },
    'payment_intent.requires_action': async (data) => { },
    'payment_intent.created': async (data) => { },
    'payment_intent.canceled': async (data) => { },
    'payment_intent.payment_failed': async (data) => { },
    'payment_intent.succeeded': async (data) => { },
    'charge.succeeded': async (data) => { },
    'customer.subscription.created': async (data) => {
        const customer = (await index_1.stripe.customers.retrieve(data.customer));
        const userSnapshot = firebaseApp_1.db.collection('users').doc(customer.metadata.firebaseUID);
        await userSnapshot.update({
            activePlans: firebase_admin_1.firestore.FieldValue.arrayUnion(data.items.data.map((item) => item.id))
        });
    },
    'customer.subscription.deleted': async (data) => { },
    'invoice.payment_succeeded': async (data) => { },
    'invoice.payment_failed': async (data) => {
        const customer = (await index_1.stripe.customers.retrieve(data.customer));
        const userSnapshot = firebaseApp_1.db.collection('users').doc(customer.metadata.firebaseUID);
        await userSnapshot.update({ status: 'PAST_DUE' });
    }
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