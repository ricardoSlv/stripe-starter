import { db } from 'firebaseApp'
import { stripe } from 'index'
import Stripe from 'stripe'
import { firestore } from 'firebase-admin'
import { getOrCreateCustomer } from './customers'

export async function createSubscription(
  userId: string,
  plan: string,
  paymentMethod: Stripe.PaymentMethod
) {
  const customer = await getOrCreateCustomer(userId)

  await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id })

  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: paymentMethod.id }
  })

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan }],
    expand: ['latest_invoice.payment_intent']
  })

  const invoice = subscription.latest_invoice as Stripe.Invoice
  const payment_intent = invoice.payment_intent as Stripe.PaymentIntent

  if (payment_intent.status === 'succeeded') {
    await db
      .collection('users')
      .doc(userId)
      .set(
        {
          stripeCustomerId: customer.id,
          activePlans: firestore.FieldValue.arrayUnion(plan)
        },
        { merge: true }
      )
  }

  return subscription
}

export async function cancelSubscription(userId: string, subscriptionId: string) {
  const customer = await getOrCreateCustomer(userId)
  if (customer.deleted !== true && customer.metadata.firebaseUID !== userId) {
    console.log(customer.metadata.firebaseUID, userId)

    throw Error('Firebase UID does not match Stripe Customer')
  }

  const subscription = await stripe.subscriptions.del(subscriptionId)
  // const subscription = await stripe.subscriptions.update(subscriptionId, {
  //   cancel_at_period_end: true
  // })

  if (subscription.status === 'canceled') {
    await db
      .collection('users')
      .doc(userId)
      .update({
        activePlans: firestore.FieldValue.arrayRemove(
          ...subscription.items.data.map((item) => item.id)
        )
      })
  }
}

export async function listSubscriptions(userId: string) {
  const customer = await getOrCreateCustomer(userId)
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id
  })

  return subscriptions
}
