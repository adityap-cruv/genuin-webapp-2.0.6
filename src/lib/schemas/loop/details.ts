import { z } from 'zod'

const ownerSchema = z.object({
  member_id: z.string(),
  name: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  username: z.string(),
  phone: z.string().optional(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
})

// Define group schema
const groupSchema = z.object({
  group_id: z.string(),
  group_name: z.string().optional(),
  group_description: z.string().nullable().optional(),
  color_code: z.string().optional(),
  text_color_code: z.string().optional(),
  dp: z.string().nullable().optional(),
  dp_s: z.string().optional(),
  dp_m: z.string().optional(),
  dp_l: z.string().optional(),
  no_of_views: z.number().optional(),
  no_of_videos: z.number().optional(),
  no_of_members: z.number().optional(),
  no_of_subscribers: z.number().optional(),
})

// Define community schema
const communitySchema = z.object({
  community_id: z.string().optional(),
  slug: z.string(),
  handle: z.string().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  color_code: z.string().optional(),
  text_color_code: z.string().optional(),
  dp: z.string().optional(),
  dp_s: z.string().optional(),
  dp_m: z.string().optional(),
  dp_l: z.string().optional(),
  share_url: z.string().optional(),
  type: z.number().optional(),
})

// Define settings schema
const settingsSchema = z.object({
  discoverable: z.boolean(),
})

// Define main schema
const LoopDetailsSchema = z.object({
  chat_id: z.string(),
  is_welcome_loop: z.boolean(),
  type: z.number(),
  share_url: z.string(),
  settings: settingsSchema,
  slug: z.string(),
  is_ai_generated: z.boolean(),
  is_view_allowed: z.boolean(),
  group: groupSchema,
  owner: ownerSchema,
  is_post_allowed: z.boolean(),
  community: communitySchema,
  is_subscriber: z.boolean(),
})

export type LoopDetailsType = z.infer<typeof LoopDetailsSchema>

export function validateLoopDetails(data: any) {
  try {
    return LoopDetailsSchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong in validation!!!')
  }
}
