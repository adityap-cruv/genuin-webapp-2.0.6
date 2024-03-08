import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  callbacks: {
    session(params) {
      console.log('in session::', params)
      return { user: params.user, expires: params.session.expires }
    },
    jwt(params) {
      console.log(params.)
      console.log('::in jwt::', params)
      return { ...params }
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/home',
    error: '/error',
    signOut: '/home',
  },
  providers: [], // Add providers with an empty array for now
  // debug: true,
} satisfies NextAuthConfig
