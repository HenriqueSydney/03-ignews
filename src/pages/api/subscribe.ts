import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { query as q } from 'faunadb'

import { stripe } from '@/services/stripe'
import { fauna } from '@/services/fauna'

type User = {
  ref: {
    id: string
  }
  data: {
    stripeCustomerId: string
  }
}

export default async (request: NextApiRequest, response: NextApiResponse) => {
  const session = await getSession({ req: request })

  const email = session?.user?.email ?? ''

  if (request.method !== 'POST' || email === '') {
    response.setHeader('Allow', 'POST')
    response.status(405).end('Method not allowed')
    return
  }

  const user = await fauna.query<User>(
    q.Get(q.Match(q.Index('user_by_email'), q.Casefold(email))),
  )

  let customerId = user.data.stripeCustomerId

  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email,
    })

    await fauna.query(
      q.Update(q.Ref(q.Collection('users'), user.ref.id), {
        data: {
          stripeCustomerId: stripeCustomer.id,
        },
      }),
    )
    customerId = stripeCustomer.id
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [{ price: 'price_1My4paG5YRsTv6ItR12WyjUS', quantity: 1 }],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: process.env.STRIPE_SUCCESS_URL as string,
    cancel_url: process.env.STRIPE_CANCEL_URL as string,
  })

  return response.status(200).json({ sessionId: stripeCheckoutSession })
}
