import type { NextAuthConfig, User } from 'next-auth'

export const authConfig = {
  callbacks: {
    session(params) {
      console.log('::session in session::', params.token.user)
      return { user: params.token.user, expires: params.session.expires }
    },
    jwt({
      // Always available but with a little difference in value
      token,
      // Available only in case of signIn, signUp or useSession().update call.
      trigger,
      // Available when useSession().update is called. The value will be the POST data
      session,
      // Available only in the first call once the user signs in. Not available in subsequent calls
      user,
      // Available only in the first call once the user signs in. Not available in subsequent calls
      account,
    }) {
      if (user && trigger === 'signIn') {
        // console.log('user in jwt::', user, account, session)
        return { user }
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: 'hCflPpaRjcKXLDwz+9vy/mYAGamxWhUqr4MBjOuV0EM=',
  pages: {
    signIn: '/home',
    error: '/error',
    signOut: '/home',
  },
  providers: [], // Add providers with an empty array for now
  debug: true,
} satisfies NextAuthConfig
