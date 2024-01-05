import { z } from 'zod'

const Owner = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  nickname: z.string(),
  phone: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string().nullish(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
})

const Group = z.object({
  group_id: z.string(),
  group_name: z.string().nullish(),
  group_description: z.string().nullish(),
  color_code: z.string(),
  tags: z.string().nullish(),
  text_color_code: z.string(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  no_of_views: z.number(),
  no_of_videos: z.number(),
  no_of_members: z.number(),
  no_of_subscribers: z.number(),
})

const Community = z.object({
  share_string: z.string(),
  name: z.string(),
  handle: z.string(),
  dp: z.string().nullish(),
  slug: z.string(),
})

const LoopDetailsSchema = z.object({
  chat_id: z.string(),
  chat_slug: z.string(),
  type: z.number(),
  settings: z.object({
    discoverable: z.boolean(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
  share_string: z.string(),
  share_url: z.string(),
  community: Community,
  owner: Owner,
  preview_image: z.string(),
  group: Group,
})

export type LoopDetailsType = z.infer<typeof LoopDetailsSchema>

export function validateLoopDetails(data: any) {
  try {
    return LoopDetailsSchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong in validation!!!')
  }
}
