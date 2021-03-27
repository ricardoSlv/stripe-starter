import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
export const app = express()

import { createStripeCheckoutSession } from 'checkout'

import { decodeJWT, validateUser } from 'utils/auth'

function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next)
  }
}

app.use((req, _, next) => {
  console.log(req.method, req.url)
  next()
})

app.use(
  express.json({
    verify: (req, _, buf) => {
      req['rawBody'] = buf
    }
  })
)

app.use(cors({ origin: true }))

app.use(decodeJWT)

app.post('/test', (req: Request, res: Response) => {
  const amount = req.body.amount

  res.status(200).send({ with_tax: amount * 7 })
})

app.post(
  '/checkouts',
  runAsync(async (req: Request, res: Response) => {
    res.send(await createStripeCheckoutSession(req.body.line_items))
  })
)

import { createPaymentIntent } from 'payments'

app.post(
  '/payments',
  runAsync(async (req: Request, res: Response) => {
    res.send(await createPaymentIntent(req.body.amount))
  })
)

import { handleStripeWebHook } from 'webhooks'
import { createSetupIntent, listPaymentCards } from 'customers'
import { cancelSubscription, createSubscription, listSubscriptions } from 'billing'

app.post('/hooks', runAsync(handleStripeWebHook))

app.post(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req)
    const setupIntent = await createSetupIntent(user.uid)
    res.send(setupIntent)
  })
)

app.get(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req)
    const wallet = await listPaymentCards(user.uid)
    res.send(wallet.data)
  })
)

app.post(
  '/subscriptions',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req)
    const { plan, paymentMethod } = req.body
    const subscription = await createSubscription(user.uid, plan, paymentMethod)
    res.send(subscription)
  })
)

app.get(
  '/subscriptions',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req)
    const subscriptions = await listSubscriptions(user.uid)
    res.send(subscriptions.data)
  })
)

app.patch(
  '/subscriptions/:id',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req)
    await cancelSubscription(user.uid, req.params.id)
    res.send(200).jsonp('Success')
  })
)
