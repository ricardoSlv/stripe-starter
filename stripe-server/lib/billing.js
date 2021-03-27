"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSubscriptions = exports.cancelSubscription = exports.createSubscription = void 0;
const firebaseApp_1 = require("firebaseApp");
const index_1 = require("index");
const firebase_admin_1 = require("firebase-admin");
const customers_1 = require("./customers");
async function createSubscription(userId, plan, paymentMethod) {
    const customer = await customers_1.getOrCreateCustomer(userId);
    await index_1.stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
    await index_1.stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: paymentMethod.id }
    });
    const subscription = await index_1.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ plan }],
        expand: ['latest_invoice.payment_intent']
    });
    const invoice = subscription.latest_invoice;
    const payment_intent = invoice.payment_intent;
    if (payment_intent.status === 'succeeded') {
        await firebaseApp_1.db
            .collection('users')
            .doc(userId)
            .set({
            stripeCustomerId: customer.id,
            activePlans: firebase_admin_1.firestore.FieldValue.arrayUnion(plan)
        }, { merge: true });
    }
    return subscription;
}
exports.createSubscription = createSubscription;
async function cancelSubscription(userId, subscriptionId) {
    const customer = await customers_1.getOrCreateCustomer(userId);
    if (customer.deleted !== true && customer.metadata.firebaseUID !== userId) {
        console.log(customer.metadata.firebaseUID, userId);
        throw Error('Firebase UID does not match Stripe Customer');
    }
    const subscription = await index_1.stripe.subscriptions.del(subscriptionId);
    // const subscription = await stripe.subscriptions.update(subscriptionId, {
    //   cancel_at_period_end: true
    // })
    if (subscription.status === 'canceled') {
        await firebaseApp_1.db
            .collection('users')
            .doc(userId)
            .update({
            activePlans: firebase_admin_1.firestore.FieldValue.arrayRemove(...subscription.items.data.map((item) => item.id))
        });
    }
}
exports.cancelSubscription = cancelSubscription;
async function listSubscriptions(userId) {
    const customer = await customers_1.getOrCreateCustomer(userId);
    const subscriptions = await index_1.stripe.subscriptions.list({
        customer: customer.id
    });
    return subscriptions;
}
exports.listSubscriptions = listSubscriptions;
//# sourceMappingURL=billing.js.map