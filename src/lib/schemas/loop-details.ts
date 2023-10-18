import { z } from 'zod'

const Owner = z.object({
  member_id: z.string(),
  name: z.string().nullable(),
  bio: z.string(),
  nickname: z.string(),
  phone: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string(),
  profile_image_m: z.string(),
  profile_image_l: z.string(),
})

const Group = z.object({
  group_id: z.string(),
  group_name: z.string(),
  group_description: z.string(),
  color_code: z.string(),
  tags: z.string(),
  text_color_code: z.string(),
  dp: z.string(),
  dp_s: z.string(),
  dp_m: z.string(),
  dp_l: z.string(),
  no_of_views: z.number(),
  no_of_videos: z.number(),
  no_of_members: z.number(),
  no_of_subscribers: z.number(),
})

const ZodObject = z.object({
  chat_id: z.string(),
  type: z.number(),
  settings: z.object({
    discoverable: z.boolean(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
  share_string: z.string(),
  share_url: z.string(),
  owner: Owner,
  preview_image: z.string(),
  group: Group,
})
