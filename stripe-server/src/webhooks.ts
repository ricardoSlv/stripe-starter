import { stripe } from 'index'
import Stripe from 'stripe'

import { Request, Response } from 'express'
import { db } from 'firebaseApp'
import { firestore } from 'firebase-admin'

const webhookHandlers = {
  'customer.created': async (data: Stripe.PaymentIntent) => {},

  'setup_intent.created': async (data: Stripe.PaymentIntent) => {},

  'checkout.session.completed': async (data: Stripe.PaymentIntent) => {},

  'payment_intent.requires_action': async (data: Stripe.PaymentIntent) => {},
  'payment_intent.created': async (data: Stripe.PaymentIntent) => {},
  'payment_intent.canceled': async (data: Stripe.PaymentIntent) => {},
  'payment_intent.payment_failed': async (data: Stripe.PaymentIntent) => {},
  'payment_intent.succeeded': async (data: Stripe.PaymentIntent) => {},

  'charge.succeeded': async (data: Stripe.PaymentIntent) => {},

  'customer.subscription.created': async (data: Stripe.Subscription) => {
    const customer = (await stripe.customers.retrieve(data.customer as string)) as Stripe.Customer
    const userSnapshot = db.collection('users').doc(customer.metadata.firebaseUID)
    await userSnapshot.update({
      activePlans: firestore.FieldValue.arrayUnion(data.items.data.map((item) => item.id))
    })
  },
  'customer.subscription.deleted': async (data: Stripe.PaymentIntent) => {},
  'invoice.payment_succeeded': async (data: Stripe.PaymentIntent) => {},
  'invoice.payment_failed': async (data: Stripe.Invoice) => {
    const customer = (await stripe.customers.retrieve(data.customer as string)) as Stripe.Customer
    const userSnapshot = db.collection('users').doc(customer.metadata.firebaseUID)
    await userSnapshot.update({ status: 'PAST_DUE' })
  }
}

export const handleStripeWebHook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(
    req['rawBody'],
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  )
  try {
    console.log('event.type :>> ', event.type)
    await webhookHandlers[event.type](event.data.object)
    res.send({ received: true })
  } catch (err) {
    console.error(err)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
}
