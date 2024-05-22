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
        user_id: { type: 'text' },
        nickname: { type: 'text' },
        profile_image: { type: 'text' },
        email: { type: 'text' },
        bio: { type: 'text' },
        name: { type: 'text' },
        is_email_verified: { type: 'text' },
        is_password_set: { type: 'text' },
        accessToken: { type: 'text' },
        ks_cb_request_status: { type: 'text' },
        is_brand_system_user: { type: 'text' },
        brand_id: { type: 'text' },
        brand_slug: { type: 'text' },
        onboarding_topics: { type: 'text' },
      },
      authorize(credentials, request) {
        return {
          isAvatar: credentials.is_avatar === 'true',
          id: String(credentials.user_id),
          nickname: String(credentials.nickname),
          image: credentials.profile_image ? String(credentials.profile_image) : undefined,
          email: credentials.email ? String(credentials.email) : undefined,
          bio: credentials.bio && credentials.bio !== 'null' ? String(credentials.bio) : undefined,
          name: credentials.name ? String(credentials.name) : undefined,
          isEmailVerified: credentials.is_email_verified === 'true',
          isPasswordSet: credentials.is_password_set === 'true',
          accessToken: String(credentials.accessToken),
          ksCbRequestStatus: credentials.ks_cb_request_status ? Number(credentials.ks_cb_request_status) : undefined,
          isBrandSystemUser: credentials.is_brand_system_user === 'true',
          brandId: credentials.brand_id ? Number(credentials.brand_id) : undefined,
          brandSlug: credentials.brand_slug ? String(credentials.brand_slug) : undefined,
          hasTopics: credentials.onboarding_topics === 'true',
        }
      },
    }),
  ],
})
