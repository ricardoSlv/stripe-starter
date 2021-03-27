import { config } from 'dotenv'
process.env.NODE_ENV != 'production' ? config() : null

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2020-08-27'
})

import { app } from 'api'
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Api available on ${port}`))
