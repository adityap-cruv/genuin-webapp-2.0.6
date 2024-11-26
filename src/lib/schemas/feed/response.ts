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
  linkouts_id: z.number().nullish(),
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
  thumbnail_url_m: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  message_id: z.string(),
  message_at: z.number().nullish(),
  owner: ownerSchema,
  meta_data: metaDataSchema,
  brand: BrandUserSchema.optional(),
  clickable_url: z.string().nullish(),
})

const brandSchema = z
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
    color_code: z.string(),
    description: z.string(),
    handle: z.string(),
    name: z.string(),
    share_string: z.string(),
    share_url: z.string(),
    slug: z.string(),
    text_color_code: z.string().nullish(),
    dp: z.string().nullish(),
    dp_s: z.string().nullish(),
    dp_m: z.string().nullish(),
    dp_l: z.string().nullish(),
    logged_in_user_role: z.number().nullish(),
    type: z.number(),
    uuid: z.string(),
    brand: brandSchema,
  })
  .nullish()

// Define the group schema
const groupSchema = z.object({
  color_code: z.string(),
  dp: z.string(),
  dp_l: z.string(),
  dp_m: z.string(),
  dp_s: z.string(),
  group_description: z.string(),
  group_id: z.string(),
  group_name: z.string(),
  member_info: z.object({}).optional(),
  settings: z.object({
    discoverable: z.boolean(),
  }),
  share_string: z.string(),
  share_url: z.string(),
  slug: z.string(),
  type: z.number(),
  uuid: z.string(),
})

const videoMetaDataSchema = z.object({
  aspect_ratio: z.string(),
  contains_external_videos: z.boolean(),
  duration: z.string(),
  media_type: z.string(),
  resolution: z.string(),
  size: z.string(),
})

const ownerSchemaFeed = z.object({
  bio: z.string(),
  is_avatar: z.boolean(),
  is_brand_system_user: z.boolean(),
  name: z.string(),
  profile_image: z.string(),
  share_url: z.string(),
  username: z.string(),
  uuid: z.string(),
})

const videoSchema = z.object({
  attached_link: z.string().nullable(),
  clickable_url: z.string().nullable(),
  conversation_at: z.number(),
  description_data: z.string().nullable(),
  description_text: z.string().nullable(),
  is_pinned: z.boolean(),
  is_read: z.boolean(),
  is_sparked: z.boolean(),
  linkouts: z.unknown().nullable(),
  linkouts_id: z.unknown().nullable(),
  linkouts_inappbrowser: z.boolean(),
  media_url: z.string(),
  media_url_m3u8: z.string(),
  meta_data: videoMetaDataSchema,
  no_of_comments: z.number(),
  no_of_shares: z.number(),
  no_of_sparks: z.number(),
  no_of_views: z.number(),
  owner: ownerSchemaFeed,
  share_url: z.string(),
  slug: z.string(),
  sprite_image_url: z.string().nullable(),
  thumbnail_url: z.string(),
  thumbnail_url_l: z.string(),
  thumbnail_url_s: z.string(),
  uuid: z.string(),
  video_summary: z.unknown().nullable(),
})
// Define the feed schema
const feedSchema = z.object({
  community: communitySchema,
  loop: groupSchema,
  owner: ownerSchema,
  type: z.string(),
  uuid: z.string(),
  video: videoSchema,
})

// TODO: Please scrap this schema if not used anywhere.
// const FeedResponseSchema = z.array(
//   z.object({
//     feed_type: z.string().nullish(),
//     feed: feedSchema,
//   })
// )

export type FeedResponseType = z.infer<typeof feedSchema>

export type FeedResponseFromGoApi = {
  uuid: string
  ads_config?: AdsConfig
  type: string
  loop: FeedLoopInfo
  community: FeedCommunityInfo
  repost?: FeedRepostInfo
  video: VideoData
  owner: FeedOwnerInfo
}

type VideoData = {
  conversation_at: number
  description_data?: string
  description_text?: string
  media_url: string
  meta_data?: any
  share_url: string
  slug: string
  thumbnail_url: string
  thumbnail_url_l: string
  thumbnail_url_s: string
  thumbnail_url_m: string
  uuid: string
  attached_link?: string
  media_url_m3u8?: string
  no_of_views?: number
  no_of_sparks?: number
  no_of_comments?: number
  video_summary?: string
  sprite_image_url?: string
  no_of_shares?: number
  linkouts?: Linkout[]
  is_sparked?: boolean
  is_read?: boolean
  clickable_url?: string
  is_pinned?: boolean
  linkouts_id?: number
}

type AdsConfig = {
  ads_url: string
}

type Link = {
  image: string
  link: string
  position: number
  title: string
}

type Linkout = {
  cta_link: string
  cta_text: string
  links: Link[]
  style?: number
}

type FeedOwnerInfo = {
  uuid: string
  name?: string
  phone?: string // json.Number equivalent
  username: string
  bio?: string
  is_avatar: boolean
  profile_image: string
  profile_image_s?: string
  profile_image_m?: string
  profile_image_l?: string
  is_brand_system_user?: boolean
  brand?: BrandInfo
  share_url?: string
}

// type FeedLoggedInUserInfo = {
//   is_read: number
//   is_loop_subscriber?: number
//   is_loop_member?: number
//   loop_member_status?: number
//   member_role?: number
//   community_role?: number
//   is_video_sparked?: boolean
// }

type MemberInfo = {
  member_role?: number
  loop_member_status?: number
}

type FeedLoopInfo = {
  group_id: string
  group_name?: string
  group_description?: string
  dp: string
  dp_s: string
  dp_m: string
  dp_l: string
  color_code?: string
  text_color_code?: string
  uuid: string
  settings?: any // json.RawMessage equivalent
  slug?: string
  share_string?: string
  type?: number
  share_url?: string
  member_info?: MemberInfo
}

type FeedCommunityInfo = {
  uuid?: string
  handle?: string
  slug?: string
  name?: string
  description?: string
  color_code?: string
  text_color_code?: string
  dp: string
  dp_s: string
  dp_m: string
  dp_l: string
  share_string?: string
  brand_id?: number
  type?: number
  share_url?: string
  logged_in_user_role?: number
  brand?: {
    brand_id: number
    brand_slug: string
    brand_web_logo: string
    name: string
  }
}

type BrandInfo = {
  brand_id: string
  brand_slug: string
}

type FeedRepostInfo = {
  // Define the properties as needed.
}
