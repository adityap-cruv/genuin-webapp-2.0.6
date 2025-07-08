import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import CredentialsProvider from 'next-auth/providers/credentials'

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      type: 'credentials',
      credentials: {
        id: { type: 'text' },
        isAvatar: { type: 'text' },
        userId: { type: 'text' },
        phoneNumber: { type: 'text' },
        nickname: { type: 'text' },
        profileImage: { type: 'text' },
        email: { type: 'text' },
        bio: { type: 'text' },
        name: { type: 'text' },
        accessToken: { type: 'text' },
        ksCbRequestStatus: { type: 'text' },
        isBrandSystemUser: { type: 'text' },
        brandId: { type: 'text' },
        brandSlug: { type: 'text' },
        hasTopics: { type: 'text' },
        refreshToken: { type: 'text' },
        birth: { type: 'text' },
        usernameSet: { type: 'text' },
      },
      authorize(credentials, request) {
        // Default values for fields that need to be strings to satisfy NextAuth User type
        const name = credentials.name === 'undefined' || credentials.name === 'null' ? '' : String(credentials.name)
        const email = credentials.email === 'undefined' || credentials.email === 'null' ? '' : String(credentials.email)

        const phoneNumber =
          credentials.phoneNumber === 'undefined' || credentials.phoneNumber === 'null'
            ? ''
            : String(credentials.phoneNumber)
        const image =
          credentials.profileImage === 'undefined' || credentials.profileImage === 'null'
            ? ''
            : String(credentials.profileImage)
        const bio = credentials.bio === 'undefined' || credentials.bio === 'null' ? '' : String(credentials.bio)
        const brandId =
          credentials.brandId === 'undefined' || credentials.brandId === 'null'
            ? undefined
            : Number(credentials.brandId)
        const brandSlug =
          credentials.brandSlug === 'undefined' || credentials.brandSlug === 'null' ? '' : String(credentials.brandSlug)
        const refreshToken =
          credentials.refreshToken === 'undefined' || credentials.refreshToken === 'null'
            ? ''
            : String(credentials.refreshToken)
        const birth = credentials.birth === 'undefined' || credentials.birth === 'null' ? '' : String(credentials.birth)

        // Return user data with empty strings instead of undefined for string fields
        return {
          isAvatar: credentials.isAvatar === 'true',
          id: String(credentials.id),
          phoneNumber,
          nickname: String(credentials.nickname),
          image,
          email,
          bio,
          name,
          accessToken: String(credentials.accessToken),
          ksCbRequestStatus: credentials.ksCbRequestStatus,
          isBrandSystemUser: credentials.isBrandSystemUser === 'true',
          brandId,
          brandSlug,
          hasTopics: credentials.hasTopics === 'true',
          refreshToken,
          birth,
          usernameSet: credentials.usernameSet === 'true',
        }
      },
    }),
  ],
})

export const handlers = nextAuth.handlers
export const auth = nextAuth.auth
export const signIn: typeof nextAuth.signIn = nextAuth.signIn
export const signOut: typeof nextAuth.signOut = nextAuth.signOut
export const { GET, POST } = nextAuth.handlers
