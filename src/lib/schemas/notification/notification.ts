import { z } from 'zod'

const User = z.object({
  user_id: z.string(),
  nickname: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  is_avatar: z.boolean(),
  is_brand_system_user: z.boolean(),
  chat_limit: z.number(),
  profile_image: z.string(),
  profile_image_s: z.string().optional(),
  profile_image_m: z.string().optional(),
  profile_image_l: z.string().optional(),
})

const Brand = z.object({
  brand_id: z.number(),
  name: z.string(),
  subdomain: z.string(),
  logo: z.string(),
  created_at: z.number(),
  brand_web_logo: z.string(),
  favicon: z.string(),
  brand_system_user_id: z.string(),
  brand_slug: z.string(),
})

const Community = z.object({
  community_id: z.string(),
  handle: z.string(),
  name: z.string(),
  is_ai_generated: z.boolean(),
  type: z.number(),
  no_of_members: z.number(),
  description: z.string(),
  color_code: z.string(),
  slug: z.string(),
  text_color_code: z.string(),
  share_url: z.string(),
  brand: Brand,
})

const Owner = z.object({
  member_id: z.string(),
  name: z.string(),
  bio: z.string(),
  phone: z.string(),
  is_brand_system_user: z.boolean(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string(),
  profile_image_m: z.string(),
  profile_image_l: z.string(),
  username: z.string(),
})

const Group = z.object({
  group_id: z.string(),
  group_name: z.string(),
  group_description: z.string(),
  color_code: z.string(),
  tags: z.string(),
  text_color_code: z.string(),
  dp: z.null(),
  dp_s: z.string().nullable(),
  dp_m: z.string().nullable(),
  dp_l: z.string().nullable(),
  no_of_views: z.number(),
  no_of_videos: z.number(),
  no_of_members: z.number(),
  no_of_subscribers: z.number(),
})

const Conversation = z.object({
  chat_id: z.string(),
  type: z.number(),
  slug: z.string(),
  settings: z.object({
    discoverable: z.boolean(),
  }),
  is_ai_generated: z.boolean(),
  owner: Owner,
  preview_image: z.string(),
  group: Group,
  share_url: z.string(),
})

const MetaData = z.object({
  size: z.string(),
  duration: z.string(),
  media_type: z.string(),
  resolution: z.string(),
  aspect_ratio: z.string(),
  contains_external_videos: z.boolean(),
})

const ConversationVideo = z.object({
  owner: Owner,
  id: z.number(),
  thumbnail_url: z.string(),
  thumbnail_url_s: z.string(),
  thumbnail_url_l: z.string(),
  no_of_views: z.number(),
  no_of_comments: z.number(),
  questions: z.array(z.unknown()),
  meta_data: MetaData,
  updated_at: z.string(),
  slug: z.string(),
  message_id: z.string(),
  message_at: z.string(),
  media_url: z.string(),
  media_url_m3u8: z.string(),
  attached_link: z.string(),
})

const Notification = z
  .array(
    z.object({
      notification_id: z.string(),
      is_read: z.boolean(),
      type: z.string(),
      created_at: z.number(),
      user: User,
      brand: Brand.optional(),
      community: Community.optional(),
      conversation: Conversation.optional(),
      conversation_video: ConversationVideo.optional(),
    })
  )
  .nullish()

const NotificationDetailsSchema = z.object({
  end_of_notifications: z.boolean(),
  notifications: Notification,
})

export type NotificationsType = z.infer<typeof Notification>

export type NotificationDetailsType = z.infer<typeof NotificationDetailsSchema>

export function validateCommunityDetails(communityDetails: NotificationDetailsType) {
  try {
    return NotificationDetailsSchema.parse(communityDetails)
  } catch (e) {
    throw new Error('parsing not done right!!!')
  }
}
