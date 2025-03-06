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

  type UpdateSession = (data: { name: string }) => Promise<Session | null>

  interface User {
    bio?: string
    email?: string
    phoneNumber?: string
    isAvatar: boolean
    name: string
    nickname: string
    image: string
    /**
     * Token to refresh accessToken.
     */
    refreshToken?: string
    accessToken: string
    /*
     * 0 - Not requested
     * 1 - Requested
     * 2 - Approved
     * 3 - Rejected
     * 4 - Pending
     */
    ksCbRequestStatus: number
    /**
     * if user is brand user.
     */
    isBrandSystemUser?: boolean
    brandId?: number
    brandSlug?: string
    /**
     * Checks if use has already topics.
     */
    hasTopics?: boolean
    birth?: string
    usernameSet: boolean
  }

  interface AdapterUser {
    bio?: string
    email: string
    phoneNumber: string
    isAvatar: boolean
    name: string
    nickname: string
    image: string
    /**
     * Token to refresh accessToken.
     */
    refreshToken?: string
    accessToken: string
    ksCbRequestStatus?: number
    /**
     * if user is brand user.
     */
    isBrandSystemUser?: boolean
    brandId?: number
    brandSlug?: string
    /**
     * Checks if use has already topics.
     */
    hasTopics?: boolean
    birth?: string
    usernameSet: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: {
      bio?: string
      email: string
      phoneNumber: string
      isAvatar: boolean
      name: string
      nickname: string
      image: string
      /**
       * Token to refresh accessToken.
       */
      refreshToken?: string
      accessToken: string
      ksCbRequestStatus?: number
      /**
       * if user is brand user.
       */
      isBrandSystemUser?: boolean
      brandId?: number
      brandSlug?: string
      /**
       * Checks if use has already topics.
       */
      hasTopics?: boolean
      birth?: string
      usernameSet: boolean
    }
  }
}
