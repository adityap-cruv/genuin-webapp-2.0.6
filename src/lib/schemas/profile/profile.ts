import { z } from 'zod'
const BrandDetailsSchema = z.object({
  brand_id: z.number(),
  videos:  z.number(),
  views: z.number(),
  no_of_communities:  z.number(),
  brand_slug: z.string(),
  brand_url: z.string(),
  })

const ProfileDetailsSchema = z.object({
  user_id: z.string(),
  nickname: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  replies: z.number().nullish(),
  is_avatar: z.boolean(),
  birthday: z.string().nullish(),
  share_url: z.string(),
  email: z.string().nullish(),
  twitter_url: z.string(),
  twitter_id: z.string().nullish(),
  insta_url: z.string(),
  insta_id: z.string().nullish(),
  linkedin_url: z.string(),
  linkedin_id: z.string().nullish(),
  tiktok_url: z.string(),
  tiktok_id: z.string().nullish(),
  marketing_subscription: z.boolean().nullish(),
  profile_image: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  is_email_verified: z.boolean().nullish(),
  no_of_communities: z.number(),
  videos: z.number(),
  views: z.string().or(z.number()),
  brand : BrandDetailsSchema.nullish()
})

export type ProfileDetailsType = z.infer<typeof ProfileDetailsSchema>

export function validateProfileDetails(data: any) {
  try {
    return ProfileDetailsSchema.parse(data)
  } catch (e) {
    console.log('error::', e)
    throw new Error('Validation error in profile details.')
  }
}
