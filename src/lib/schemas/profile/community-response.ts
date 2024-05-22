import { z } from 'zod'

const messageSchema = z.object({
  media_url: z.string(),
  media_url_m3u8: z.string().nullish(),
  slug: z.string(),
  no_of_views: z.number(),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  message_id: z.string(),
  message_at: z.number().nullish(),
})

const actionsSchema = z.array(
  z.object({
    action_id: z.number(),
    access_type_id: z.number(),
  })
)

const loopSchema = z.object({
  chat_id: z.string(),
  is_view_allowed: z.boolean(),
  slug: z.string(),
  group: z.object({
    group_id: z.string(),
    group_name: z.string().nullish(),
    group_description: z.string().nullish(),
    no_of_videos: z.number(),
  }),
  messages: z.array(messageSchema),
  actions: actionsSchema,
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

const CommunitySchema = z.object({
  brand: BrandSchema.optional(),
  community_id: z.string(),
  type: z.number().nullish(),
  slug: z.string(),
  handle: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  dp: z.string().url().nullish(),
  dp_s: z.string().url().nullish(),
  dp_m: z.string().url().nullish(),
  dp_l: z.string().url().nullish(),
  share_url: z.string().url().nullish(),
  role: z.number().nullish(),
  is_community_join_requested: z.boolean().nullish(),
  no_of_loops: z.number(),
  loops: z.array(loopSchema),
})

const CommunityListSchema = z.array(CommunitySchema)

export type ProfileCommunityResponseType = z.infer<typeof CommunitySchema>

export type ProfileLoopResponseType = z.infer<typeof loopSchema>

export type ProfileVideoResponseType = z.infer<typeof messageSchema>

export function validateProfileCommunity(data: any) {
  try {
    return CommunityListSchema.parse(data)
  } catch (e) {
    console.log('error in validation of profile community::', e)
    throw new Error('error in validation of profile community')
  }
}

export function validateProfileLoopResponse(data: any) {
  try {
    return loopSchema.parse(data)
  } catch (e) {
    console.log('error in validation:', e)
    throw new Error('error in validation of profile loops.')
  }
}

export function validateProfileVideoResponse(data: any) {
  try {
    return z.array(messageSchema).parse(data)
  } catch (e) {
    console.log('error in validation of profile videos::', e)
    throw new Error('error in validation of profile videos')
  }
}
