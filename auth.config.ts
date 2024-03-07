import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      // if (isOnDashboard) {
      //   if (isLoggedIn) return true
      //   return false // Redirect unauthenticated users to login page
      // } else if (isLoggedIn) {
      //   return Response.redirect(new URL('/explore', nextUrl))
      // }
      console.log('true::', auth)
      return true
    },
  },
  pages: {
    signIn: '/home',
    error: '/error',
    signOut: '/home',
  },
  providers: [], // Add providers with an empty array for now
  debug: true,
  session: {
    maxAge: 50,
  },
} satisfies NextAuthConfig
