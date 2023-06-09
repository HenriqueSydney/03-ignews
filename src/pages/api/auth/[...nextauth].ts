import { query as q } from 'faunadb'

import GithubProvider from 'next-auth/providers/github'

import { fauna } from '@/services/fauna'
import NextAuth from 'next-auth'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user',
        },
      },
    }),
  ],
  secret: process.env.SIGNIN_KEY,
  callbacks: {
    async session({ session }) {
      try {
        const userActiveSubscription = await fauna.query<string>(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  'ref',
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email),
                    ),
                  ),
                ),
              ),
              q.Match(q.Index('subscription_by_status'), 'active'),
            ]),
          ),
        )

        return {
          ...session,
          activeSubscription: userActiveSubscription,
        }
      } catch {
        return {
          ...session,
          activeSubscription: null,
        }
      }
    },
    async signIn({ user }) {
      const { email } = user

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index('user_by_email'), q.Casefold(email ?? '')),
              ),
            ),
            q.Create(q.Collection('users'), { data: { user_email: email } }),
            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(email ?? ''))),
          ),
        )

        return true
      } catch (err) {
        return false
      }
    },
  },
})
