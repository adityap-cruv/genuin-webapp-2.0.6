import { z } from 'zod'

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
  unread_message_count: z.number().nullish(),
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
    console.log('error::', e)
    throw new Error('Something went wrong with validation of community loop list validation.')
  }
}
