import { z } from 'zod'

const BrandUserSchema = z
  .object({
    brand_id: z.number(),
    brand_slug: z.string(),
  })
  .nullish()

const ownerSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  phone: z.string().nullish(),
  username: z.string(),
  bio: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  brand: BrandUserSchema.optional(),
})

// Define the meta data schema
const metaDataSchema = z.object({
  duration: z.string().nullish(),
  resolution: z.string().nullish(),
  size: z.string().nullish(),
  aspect_ratio: z.string().nullish(),
})

// Define the message schema
const messageSchema = z.object({
  media_url: z.string(),
  media_url_m3u8: z.string().nullish(),
  attached_link: z.string().nullish(),
  slug: z.string(),
  description_text: z.string().nullish(),
  description_data: z.string().nullish(),
  no_of_views: z.number().default(0),
  no_of_comments: z.number().default(0),
  no_of_sparks: z.number().default(0),
  is_sparked: z.boolean().default(false),
  message_summary: z.string().nullish(),
  share_url: z.string(),
  questions: z.array(z.unknown()).nullish(),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  message_id: z.string(),
  message_at: z.number().nullish(),
  owner: ownerSchema,
  meta_data: metaDataSchema,
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

// Define the community schema
const communitySchema = z
  .object({
    brand: BrandSchema.optional(),
    community_id: z.string(),
    handle: z.string(),
    slug: z.string(),
    name: z.string().nullish(),
    description: z.string().nullish(),
    color_code: z.string().nullish(),
    logged_in_user_role: z.number().nullish(),
    text_color_code: z.string().nullish(),
    dp: z.string().nullish(),
    dp_s: z.string().nullish(),
    dp_m: z.string().nullish(),
    dp_l: z.string().nullish(),
    share_url: z.string().nullish(),
    type: z.number().nullish(),
  })
  .nullish()

// Define the group schema
const groupSchema = z.object({
  group_id: z.string(),
  group_name: z.string().nullish(),
  group_description: z.string().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
})

// Define the feed schema
const feedSchema = z.object({
  chat_id: z.string(),
  settings: z.object({
    discoverable: z.boolean().nullish(),
  }),
  slug: z.string(),
  share_url: z.string(),
  type: z.number().nullish(),
  is_subscriber: z.boolean().nullish(),
  member_info: z.unknown().nullish(),
  is_post_allowed: z.boolean().default(false),
  community: communitySchema,
  messages: z.array(messageSchema).max(1),
  group: groupSchema,
})

// Define the main schema
const FeedResponseSchema = z.array(
  z.object({
    feed_type: z.string().nullish(),
    feed: feedSchema,
  })
)

export type FeedResponseType = z.infer<typeof FeedResponseSchema>

export function validateFeedResponse(data: any) {
  try {
    return FeedResponseSchema.parse(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error in parsing feed response::', e)
    throw new Error('error in validation of feed response.')
  }
}
