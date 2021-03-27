import { NextFunction, Request, Response } from 'express'
import { auth } from 'firebaseApp'

export async function decodeJWT(req: Request, _: Response, next: NextFunction) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1]

    try {
      const decodedToken = await auth.verifyIdToken(idToken)
      req['currentUser'] = decodedToken
    } catch (err) {
      console.log(err)
    }
  }

  next()
}

export function validateUser(req: Request) {
  const user = req['currentUser']
  if (!user) {
    throw new Error('You must be logged in to make this request. i.e Authorization: Bearer <token>')
  }

  return user
}
