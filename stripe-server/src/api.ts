import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
export const app = express()

import { createStripeCheckoutSession } from 'checkout'

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

app.post('/hooks', runAsync(handleStripeWebHook))
