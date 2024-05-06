// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { Session } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User
  }

  interface User {
    bio?: string
    email: string
    isAvatar: boolean
    name: string
    nickname: string
    isEmailVerified: boolean
    isPasswordSet: boolean
    image: string
    accessToken: string
    ks_cb_request_status?: number
  }

  // interface AdapterUser {
  //   bio?: string
  //   email: string
  //   isAvatar: boolean
  //   memberId: string
  //   name: string
  //   nickname: string
  //   isEmailVerified: boolean
  //   isPasswordSet: boolean
  //   image: string
  // }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: {
      bio?: string
      email?: string | null
      isAvatar: boolean
      name?: string | null
      nickname: string
      isEmailVerified: boolean
      isPasswordSet: boolean
      image?: string | null
      accessToken: string
      ks_cb_request_status?: number
    }
  }
}
