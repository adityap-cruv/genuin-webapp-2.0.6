import type { NextAuthConfig } from 'next-auth'
import { headers } from 'next/headers'

function checkAndAppendHttps(link: string): string {
  return link?.startsWith('http') || link?.startsWith('https') ? link : 'https://' + link
}

export const authConfig = {
  callbacks: {
    session(params) {
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
      console.log('::session in session::', token.user)
      if (user && trigger === 'signIn') {
        // console.log('user in jwt::', user, account, session)
        return { user }
      }
      return token
    },
    redirect({ baseUrl, url }) {
      console.log('header host::', headers().get('host'))
      console.log('base url::;', baseUrl)
      console.log('url::', url)
      baseUrl = checkAndAppendHttps(headers().get('host') ?? 'app.qa.begenuin.com')
      return baseUrl
    },
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/home',
    error: '/error',
    signOut: '/home',
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
