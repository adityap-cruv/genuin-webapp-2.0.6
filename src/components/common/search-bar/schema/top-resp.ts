import { z } from 'zod'

const memberSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  username: z.string(),
  is_avatar: z.boolean(),
  status: z.number().int(),
  role: z.number().int(),
  profile_image: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
})

// Define the schema for the group in the object
const groupSchema = z.object({
  group_id: z.string(),
  group_name: z.string().nullish(),
  group_description: z.string().nullish(),
  color_code: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  text_color_code: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  no_of_members: z.number().default(0),
  no_of_subscribers: z.number().default(0),
  no_of_views: z.number().int().default(0),
  no_of_videos: z.number().int().default(0),
  dp: z.string().nullable().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  members: z.array(memberSchema),
})

// Define the schema for the latest message
const latestMessageSchema = z.object({
  message_id: z.string(),
  message_at: z.string(),
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

// Define the main schema for the provided object
const LoopSchema = z.object({
  chat_id: z.string(),
  type: z.number().int(),
  slug: z.string(),
  share_url: z.string(),
  settings: z.object({
    discoverable: z.boolean(),
  }),
  latest_message_at: z.string().nullish(),
  is_ai_generated: z.boolean().default(false),
  is_welcome_loop: z.boolean().default(false),
  is_subscriber: z.boolean().default(false),
  is_post_allowed: z.boolean().default(false),
  is_view_allowed: z.boolean().default(true),
  latest_messages: z.array(latestMessageSchema),
  group: groupSchema,
})

const BrandUserSchema = z
  .object({
    brand_id: z.number(),
    brand_slug: z.string(),
    brand_user_logo: z.number(),
  })
  .nullish()

const ProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(), // `user_id` should be a valid UUID
  nickname: z.string(), // `nickname` is a string
  name: z.string().nullish(), // `name` is a string
  bio: z.string().nullish(), // `bio` is a nullable string
  phone: z.string().nullish(), // `phone` is a nullable string
  is_avatar: z.boolean(), // `is_avatar` is a boolean
  chat_limit: z.number().int(), // `chat_limit` should be an integer
  profile_image: z.string(), // `profile_image` should be a valid URL
  profile_image_s: z.string().nullish(), // `profile_image_s` should be a valid URL
  profile_image_m: z.string().nullish(), // `profile_image_m` should be a valid URL
  profile_image_l: z.string().nullish(), // `profile_image_l` should be a valid URL
  brand: BrandUserSchema.optional(),
})

const BrandTypeSchema = z
  .object({
    brand_id: z.number(),
    name: z.string().nullable(),
    subdomain: z.string().nullable(),
    logo: z.string().nullable(),
    created_at: z.number(),
    brand_web_logo: z.string().nullable(),
    brand_user_logo: z.number().nullish().default(1),
    favicon: z.string(),
    brand_system_user_id: z.string().nullable(),
    brand_slug: z.string(),
  })
  .nullish()

const CommunitySchema = z.object({
  brand: BrandTypeSchema.optional(),
  community_id: z.string(),
  handle: z.string(),
  name: z.string().nullish(),
  is_ai_generated: z.boolean().default(false),
  no_of_members: z.number().int().min(0),
  description: z.string().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  color_code: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  slug: z.string(),
  text_color_code: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  share_url: z.string(),
  type: z.number().nullish(),
})

const metaDataSchema = z.object({
  contains_external_videos: z.boolean().default(false),
  aspect_ratio: z.string().nullish(),
  resolution: z.string().nullish(),
  duration: z.string().nullish(),
  size: z.string().nullish(),
})

// Define the schema for the owner of the message
const ownerSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  username: z.string(),
  bio: z.string().nullish(),
  phone: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
})

const VideoSchema = z.object({
  chat_id: z.string(),
  message_id: z.string(),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_m: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  attached_link: z.string().nullish(),
  media_url_m3u8: z.string().nullish(),
  message_at: z.number(),
  media_url: z.string(),
  share_url: z.string(),
  no_of_comments: z.number().default(0),
  slug: z.string(),
  no_of_views: z.number().default(0),
  message_summary: z.string().nullish(),
  is_ai_generated: z.boolean().default(false),
  meta_data: metaDataSchema,
  owner: ownerSchema,
})

const RankingSchema = z.array(z.enum(['videos', 'loops', 'people', 'communities']))
const communitiesSchema = z.array(CommunitySchema).nullish()
const loopsSchema = z.array(LoopSchema).nullish()
const peopleSchema = z.array(ProfileSchema).nullish()
const videosSchema = z.array(VideoSchema).nullish()

export type CommunitiesResType = z.infer<typeof communitiesSchema>

export type LoopsResType = z.infer<typeof loopsSchema>
export type LoopResType = z.infer<typeof LoopSchema>

export type PeopleResType = z.infer<typeof peopleSchema>

export type VideosResType = z.infer<typeof videosSchema>

export type RankingResType = z.infer<typeof RankingSchema>

const TopResponseSchema = z.object({
  ranking: RankingSchema,
  communities: communitiesSchema,
  loops: loopsSchema,
  people: peopleSchema,
  videos: videosSchema,
})

export function validateTopResponse(data: any) {
  try {
    return TopResponseSchema.parse(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Validataion error::', e)
    throw new Error('Something went wront with search api.')
  }
}
