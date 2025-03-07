import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import credentials from 'next-auth/providers/credentials'

export const {
  handlers: { GET, POST },
  signIn,
  auth,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    credentials({
      name: 'credentials',
      type: 'credentials',
      credentials: {
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
        const name =
          credentials.name === 'undefined' || credentials.name === 'null' ? undefined : String(credentials.name)
        const email =
          credentials.email === 'undefined' || credentials.email === 'null' ? undefined : String(credentials.email)

        const phoneNumber =
          credentials.phoneNumber === 'undefined' || credentials.phoneNumber === 'null'
            ? undefined
            : String(credentials.phoneNumber)
        const image =
          credentials.profileImage === 'undefined' || credentials.profileImage === 'null'
            ? undefined
            : String(credentials.profileImage)
        const bio = credentials.bio === 'undefined' || credentials.bio === 'null' ? undefined : String(credentials.bio)
        const brandId =
          credentials.brandId === 'undefined' || credentials.brandId === 'null'
            ? undefined
            : Number(credentials.brandId)
        const brandSlug =
          credentials.brandSlug === 'undefined' || credentials.brandSlug === 'null'
            ? undefined
            : String(credentials.brandSlug)
        const refreshToken =
          credentials.refreshToken === 'undefined' || credentials.refreshToken === 'null'
            ? undefined
            : String(credentials.refreshToken)
        const birth =
          credentials.birth === 'undefined' || credentials.birth === 'null' ? undefined : String(credentials.birth)
        return {
          isAvatar: credentials.isAvatar === 'true',
          id: String(credentials.userId),
          phoneNumber,
          nickname: String(credentials.nickname),
          image,
          email,
          bio,
          name,
          accessToken: String(credentials.accessToken),
          ksCbRequestStatus: Number(credentials.ksCbRequestStatus),
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
