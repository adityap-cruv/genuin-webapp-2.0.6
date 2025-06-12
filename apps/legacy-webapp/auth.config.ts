import type { NextAuthConfig } from 'next-auth'
import { headers } from 'next/headers'

function checkAndAppendHttps(link: string): string {
  return link?.startsWith('http') || link?.startsWith('https')
    ? link
    : (process.env.NEXT_PUBLIC_CURRENT_ENV === 'local' ? 'http://' : 'https://') + link
}

export const authConfig = {
  callbacks: {
    session(params: any) {
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
    }: {
      token: any
      trigger?: 'signIn' | 'signUp' | 'update' | undefined
      session?: any
      user?: any
      account?: any
    }) {
      if (trigger === 'update') {
        return session
      }
      if (user && trigger === 'signIn') {
        return { ...token, user }
      }
      return token
    },
    authorized({ auth, request }: { auth: any; request: any }) {
      return !!auth?.user
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      const headersList = await headers()
      baseUrl = checkAndAppendHttps(headersList.get('host') ?? 'app.qa.begenuin.com')
      if (url.startsWith('/')) baseUrl += url
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
