import { z } from 'zod'

const BrandUserSchema = z.object({
  brand_id: z.number(),
  brand_slug: z.string(),
})

const socialLinksSchema = z.object({
  social_web_url: z.string().nullish(),
  twitter: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
  linkedin: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
  insta: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
})

const moderatorSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  role: z.number().nullish(),
})

const leaderSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  role: z.number().optional(),
  brand: BrandUserSchema.optional(),
})

const guidelineSchema = z.object({
  id: z.number(),
  position: z.number(),
  title: z.string(),
  guideline_id: z.number(),
  description: z.string(),
})

const MembersSchema = z.object({
  member_id: z.string(),
  status: z.number(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  role: z.number(),
  phone: z.string().nullish(),
  brand: BrandUserSchema.optional(),
})

const BrandSchema = z
  .object({
    brand_id: z.number(),
    name: z.string(),
    subdomain: z.string(),
    logo: z.string().url(),
    created_at: z.number(),
    brand_web_logo: z.string().url(),
    favicon: z.string().url(),
    brand_system_user_id: z.string(),
    brand_slug: z.string(),
  })
  .nullish()

const CommunityDetailsSchema = z.object({
  brand: BrandSchema.optional(),
  banner: z.string().nullish(),
  community_id: z.string(),
  handle: z.string(),
  slug: z.string(),
  name: z.string().nullish(),
  type: z.number(),
  description: z.string().nullish(),
  is_community_join_requested: z.boolean(),
  is_loop_creation_allowed: z.boolean().nullish(),
  logged_in_user_role: z
    .number()
    .nullish()
    .transform((item) => {
      if (!item) return
      if (item === 1) return 'LEADER'
      if (item === 2) return 'MEMBER'
    }),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  welcome_loop_id: z.number().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  share_url: z.string(),
  no_of_members: z.number(),
  no_of_loops: z.number(),
  no_of_videos: z.number(),
  categories: z
    .array(
      z.object({
        category_id: z.number(),
        title: z.string(),
      })
    )
    .optional(),
  social_links: socialLinksSchema,
  moderators: z.array(moderatorSchema),
  is_ai_generated: z.boolean(),
  leader: leaderSchema,
  guidelines: z.array(guidelineSchema),
  preview_image: z.string().optional(),
})

export type CommunityDetailsType = z.infer<typeof CommunityDetailsSchema>
export type MembersSchemaType = z.infer<typeof MembersSchema>

export function validateCommunityDetails(communityDetails: CommunityDetailsType) {
  try {
    return CommunityDetailsSchema.parse(communityDetails)
  } catch (e) {
    console.log('error:', e)
    throw new Error('parsing not done right!!!')
  }
}
