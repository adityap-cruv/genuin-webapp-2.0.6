import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: { action: { label: 'Action', type: 'text' }, mobile: { label: 'Mobile Number', type: 'tel' } },
      async authorize(credentials, req) {
        console.log('credentials::', credentials)
        if (credentials?.action === 'sent-otp') {
          console.log('send otp enabled')
        }
        return { id: '1', name: 'himanshu', email: 'himanshu@begenuin.com' }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/signup',
  },
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken
      session.user.id = token.id

      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
