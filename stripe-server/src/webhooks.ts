import { stripe } from 'index'
import Stripe from 'stripe'

import { Request, Response } from 'express'

const webhookHandlers = {
  'payment_intent.succeeded': async (data: Stripe.PaymentIntent) => {},
  'payment_intent.payment_failed': async (data: Stripe.PaymentIntent) => {},
  'payment_intent.created': async (data: Stripe.PaymentIntent) => {},
  'charge.succeeded': async (data: Stripe.PaymentIntent) => {}
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
