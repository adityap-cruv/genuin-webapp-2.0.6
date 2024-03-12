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
        is_avatar: { type: 'text' },
        member_id: { type: 'text' },
        nickname: { type: 'text' },
        profile_image: { type: 'text' },
        email: { type: 'text' },
        bio: { type: 'text' },
        name: { type: 'text' },
        is_email_verified: { type: 'text' },
        is_password_set: { type: 'text' },
      },
      authorize(credentials, request) {
        return {
          isAvatar: credentials.is_avatar === 'true',
          id: String(credentials.member_id),
          nickname: String(credentials.nickname),
          image: credentials.profile_image ? String(credentials.profile_image) : undefined,
          email: credentials.email ? String(credentials.email) : undefined,
          bio: credentials.bio ? String(credentials.bio) : undefined,
          name: credentials.bio ? String(credentials.name) : undefined,
          isEmailVerified: credentials.is_email_verified === 'true',
          isPasswordSet: credentials.is_password_set === 'true',
        }
      },
    }),
  ],
})
