// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { Session } from 'next-auth'

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
    memberId: string
    name: string
    nickname: string
    isEmailVerified: boolean
    isPasswordSet: boolean
    image: string
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
