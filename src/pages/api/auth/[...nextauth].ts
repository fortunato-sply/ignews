import { query as q } from 'faunadb'

import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { fauna } from '../../../services/fauna'

import signIn from 'next-auth'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn( User ) {
      const email = User.user.email

      const searchUserByEmail = q.Match(
        q.Index('user_by_email'),
        q.Casefold(email)
      )

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(searchUserByEmail)
            ),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get(searchUserByEmail)
          )
        )

        return true
      } catch {
        return
      }
    }
  },
})
