import { z } from 'zod'

const socialLinksSchema = z.object({
  social_web_url: z.string().nullable(),
  twitter: z
    .object({
      id: z.string().nullable(),
      url: z.string().nullable(),
    })
    .nullable(),
  linkedin: z
    .object({
      id: z.string().nullable(),
      url: z.string().nullable(),
    })
    .nullable(),
  insta: z
    .object({
      id: z.string().nullable(),
      url: z.string().nullable(),
    })
    .nullable(),
})

const moderatorSchema = z.object({
  member_id: z.string(),
  name: z.string(),
  bio: z.string(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string().nullable(),
  profile_image_m: z.string().nullable(),
  profile_image_l: z.string().nullable(),
  role: z.number().nullable(),
})

const leaderSchema = z.object({
  member_id: z.string(),
  name: z.string().nullable(),
  bio: z.string(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  role: z.number().optional(),
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
  name: z.string().nullable(),
  bio: z.string().nullable(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  role: z.number(),
  phone: z.string().nullable(),
})

const CommunityDetailsSchema = z.object({
  community_id: z.string(),
  handle: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.number(),
  description: z.string().nullable(),
  is_community_join_requested: z.boolean(),
  color_code: z.string(),
  text_color_code: z.string(),
  welcome_loop_id: z.number().nullable(),
  dp: z.string().nullable(),
  dp_s: z.string().nullable(),
  dp_m: z.string().nullable(),
  dp_l: z.string().nullable(),
  share_url: z.string().nullable(),
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
    throw new Error('parsing not done right!!!')
  }
}
