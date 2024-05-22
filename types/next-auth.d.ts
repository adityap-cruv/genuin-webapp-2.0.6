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
    email: string
    isAvatar: boolean
    name: string
    nickname: string
    isEmailVerified: boolean
    isPasswordSet: boolean
    image: string
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
      is_brand_system_user?: boolean
      brand_id?: number
      brand_slug?: string
    }
  }
}
