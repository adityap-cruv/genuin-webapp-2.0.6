import { z } from 'zod'

const BrandUserSchema = z.object({
  brand_id: z.number(),
  brand_slug: z.string(),
  brand_user_logo: z.number().nullish().default(1),
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
  discord_url: z.string().nullish(),
  reddit_id: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
})

const brandGuidelineSchema = z
  .object({
    id: z.number(),
    position: z.number(),
    title: z.string(),
    guideline_id: z.number().nullable(),
    description: z.string(),
  })
  .optional()

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
  brand: BrandUserSchema.optional(),
})

const leaderSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  role: z.number().optional(),
  is_brand_system_user: z.boolean().optional(),
  brand: BrandUserSchema.optional(),
})

const guidelineSchema = z.object({
  id: z.number(),
  position: z.number(),
  title: z.string(),
  guideline_id: z.number().nullish(),
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
    logo: z.string().url().nullish(),
    created_at: z.number(),
    brand_web_logo: z.string().url().nullish(),
    favicon: z.string().url().nullish(),
    brand_system_user_id: z.string(),
    brand_slug: z.string(),
    brand_user_logo: z.number().nullish().default(1),
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
  logged_in_user_role: z.number(),
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
      }),
    )
    .optional(),
  social_links: socialLinksSchema,
  moderators: z.array(moderatorSchema),
  is_ai_generated: z.boolean(),
  leader: leaderSchema,
  guidelines: z.array(guidelineSchema),
  brand_guidelines: z.array(brandGuidelineSchema),
  preview_image: z.string().optional(),
})

export type CommunityDetailsType = z.infer<typeof CommunityDetailsSchema>
export type MembersType = z.infer<typeof MembersSchema>

export function validateCommunityDetails(
  communityDetails: CommunityDetailsType,
) {
  try {
    return communityDetails
    // return CommunityDetailsSchema.parse(communityDetails)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error in parsing community details:', e)
    throw new Error('parsing not done right!!!')
  }
}
// Define the member schema for members array in the group object
const memberSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  username: z.string(),
  is_avatar: z.boolean(),
  status: z.number().nullish(),
  role: z.number().nullish(),
  profile_image: z.string(),
})

// Define the group schema
const groupSchema = z.object({
  group_id: z.string(),
  group_name: z.string().nullish(),
  group_description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  no_of_members: z.number().default(0),
  no_of_subscribers: z.number().default(0),
  no_of_views: z.number().default(0),
  no_of_videos: z.number().default(0),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  members: z.array(memberSchema),
})

// Define the latest message schema
const latestMessageSchema = z.object({
  message_id: z.string(),
  message_at: z.string().nullish(),
  slug: z.string(),
  owner: z.object({
    member_id: z.string(),
    username: z.string(),
  }),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_m: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
})

// Define the settings schema
const settingsSchema = z.object({
  discoverable: z.boolean(),
})

// Define the main schema
const CommunityLoopSchema = z.object({
  chat_id: z.string(),
  type: z.number().nullish(),
  slug: z.string(),
  share_url: z.string(),
  latest_message_at: z.string().nullish(),
  is_ai_generated: z.boolean().default(false),
  template_id: z.string().or(z.number()).nullish(),
  is_welcome_loop: z.boolean().nullish(),
  member_info: z.unknown().nullish(),
  is_subscriber: z.boolean().nullish(),
  is_post_allowed: z.boolean().nullish(),
  is_view_allowed: z.boolean().default(true),
  unread_message_count: z.number(),
  latest_messages: z.array(latestMessageSchema),
  group: groupSchema,
  settings: settingsSchema,
})

const CommunityLoopListSchema = z.array(CommunityLoopSchema)

export type CommunityLoopType = z.infer<typeof CommunityLoopSchema>

export type CommunityLoopListType = z.infer<typeof CommunityLoopListSchema>

export function validateCommunityLoopList(data: any) {
  try {
    return CommunityLoopListSchema.parse(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error in parsing community loop list::', e)
    throw new Error(
      'Something went wrong with validation of community loop list validation.',
    )
  }
}
