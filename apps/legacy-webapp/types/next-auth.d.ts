// Updated for Next-Auth 5.0
import { DefaultSession } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: User
    error?: 'RefreshAccessTokenError'
  }

  // For use with session callback return type
  interface JWT {
    user?: User
  }

  // For use with the useSession().update function in React 19
  type UpdateSession = (data?: { user?: Partial<User> }) => Promise<Session>

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
    /**
     * The status can be:
     * - 1: Pending to request.
     * - 2: Requested. -> If request is rejected or approved then the status will be updated to 3 (in case of appr.) or 1 (in case of rejected).
     * - 3: Accepted.
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
  }
}
