import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import credentials from 'next-auth/providers/credentials'

export const {
  handlers: { GET, POST },
  signIn,
  auth,
} = NextAuth({
  ...authConfig,
  providers: [
    credentials({
      credentials: {
        username: { type: 'text' },
      },
      authorize(credentials, request) {
        console.log('credentials:', credentials)
        return { authToken: '23' }
      },
    }),
  ],
})
