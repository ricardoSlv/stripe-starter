import { db } from 'firebaseApp'
import { stripe } from 'index'
import Stripe from 'stripe'

export async function getOrCreateCustomer(userId: string, params?: Stripe.CustomerCreateParams) {
  const userSnapshot = await db.collection('users').doc(userId).get()

  const firebaseUser = userSnapshot.data()
  const { stripeCustomerId, email } = firebaseUser

  if (!firebaseUser) {
    console.log('getOrCreateCustomer, firebase User does not exist')
    return null
  } else if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        firebaseUID: userId
      },
      ...params
    })
    await userSnapshot.ref.update({ stripeCustomerId: customer.id })
    return customer
  } else {
    return await stripe.customers.retrieve(stripeCustomerId)
  }
}

export async function createSetupIntent(userId: string) {
  const customer = await getOrCreateCustomer(userId)

  return stripe.setupIntents.create({
    customer: customer.id
  })
}

export async function listPaymentCards(userId: string) {
  const customer = await getOrCreateCustomer(userId)

  return stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card'
  })
}
