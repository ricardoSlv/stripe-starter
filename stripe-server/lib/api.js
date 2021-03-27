"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
exports.app = express_1.default();
const checkout_1 = require("checkout");
const auth_1 = require("utils/auth");
function runAsync(callback) {
    return (req, res, next) => {
        callback(req, res, next).catch(next);
    };
}
exports.app.use((req, _, next) => {
    console.log(req.method, req.url);
    next();
});
exports.app.use(express_1.default.json({
    verify: (req, _, buf) => {
        req['rawBody'] = buf;
    }
}));
exports.app.use(cors_1.default({ origin: true }));
exports.app.use(auth_1.decodeJWT);
exports.app.post('/test', (req, res) => {
    const amount = req.body.amount;
    res.status(200).send({ with_tax: amount * 7 });
});
exports.app.post('/checkouts', runAsync(async (req, res) => {
    res.send(await checkout_1.createStripeCheckoutSession(req.body.line_items));
}));
const payments_1 = require("payments");
exports.app.post('/payments', runAsync(async (req, res) => {
    res.send(await payments_1.createPaymentIntent(req.body.amount));
}));
const webhooks_1 = require("webhooks");
const customers_1 = require("customers");
const billing_1 = require("billing");
exports.app.post('/hooks', runAsync(webhooks_1.handleStripeWebHook));
exports.app.post('/wallet', runAsync(async (req, res) => {
    const user = auth_1.validateUser(req);
    const setupIntent = await customers_1.createSetupIntent(user.uid);
    res.send(setupIntent);
}));
exports.app.get('/wallet', runAsync(async (req, res) => {
    const user = auth_1.validateUser(req);
    const wallet = await customers_1.listPaymentCards(user.uid);
    res.send(wallet.data);
}));
exports.app.post('/subscriptions', runAsync(async (req, res) => {
    const user = auth_1.validateUser(req);
    const { plan, paymentMethod } = req.body;
    const subscription = await billing_1.createSubscription(user.uid, plan, paymentMethod);
    res.send(subscription);
}));
exports.app.get('/subscriptions', runAsync(async (req, res) => {
    const user = auth_1.validateUser(req);
    const subscriptions = await billing_1.listSubscriptions(user.uid);
    res.send(subscriptions.data);
}));
exports.app.patch('/subscriptions/:id', runAsync(async (req, res) => {
    const user = auth_1.validateUser(req);
    await billing_1.cancelSubscription(user.uid, req.params.id);
    res.send(200).jsonp('Success');
}));
//# sourceMappingURL=api.js.map