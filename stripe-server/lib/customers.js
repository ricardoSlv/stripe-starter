"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPaymentCards = exports.createSetupIntent = exports.getOrCreateCustomer = void 0;
const firebaseApp_1 = require("firebaseApp");
const index_1 = require("index");
async function getOrCreateCustomer(userId, params) {
    const userSnapshot = await firebaseApp_1.db.collection('users').doc(userId).get();
    const firebaseUser = userSnapshot.data();
    const { stripeCustomerId, email } = firebaseUser;
    if (!firebaseUser) {
        console.log('getOrCreateCustomer, firebase User does not exist');
        return null;
    }
    else if (!stripeCustomerId) {
        const customer = await index_1.stripe.customers.create(Object.assign({ email, metadata: {
                firebaseUID: userId
            } }, params));
        await userSnapshot.ref.update({ stripeCustomerId: customer.id });
        return customer;
    }
    else {
        return await index_1.stripe.customers.retrieve(stripeCustomerId);
    }
}
exports.getOrCreateCustomer = getOrCreateCustomer;
async function createSetupIntent(userId) {
    const customer = await getOrCreateCustomer(userId);
    return index_1.stripe.setupIntents.create({
        customer: customer.id
    });
}
exports.createSetupIntent = createSetupIntent;
async function listPaymentCards(userId) {
    const customer = await getOrCreateCustomer(userId);
    return index_1.stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card'
    });
}
exports.listPaymentCards = listPaymentCards;
//# sourceMappingURL=customers.js.map