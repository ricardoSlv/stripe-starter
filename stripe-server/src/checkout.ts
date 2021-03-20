import { stripe } from 'index'

import Stripe from 'stripe'

export async function createStripeCheckoutSession(
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[]
) {
  const url = process.env.WEBAPP_URL

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    success_url: `${url}/sucess?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/failed`
  })

  return session
}
