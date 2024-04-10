import { z } from 'zod'

const MetaDataSchema = z.object({
  size: z.string().nullish(),
  duration: z.string().nullish(),
  media_type: z.string().nullish(),
  resolution: z.string().nullish(),
  aspect_ratio: z.string().nullish(),
  contains_external_videos: z.boolean().nullish(),
})

const OwnerSchema = z.object({
  member_id: z.string(),
  name: z.string().nullable(),
  phone: z.string().nullish(),
  bio: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  username: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
})

const LoopVideoSchema = z.object({
  is_sparked: z.boolean().nullish(),
  message_id: z.string(),
  // TODO: REMOVE NULLISH ONCE BACKEND BUG IS RESOLVED.
  slug: z.string().nullish(),
  no_of_views: z.number().nullable(),
  no_of_comments: z.number().nullable(),
  message_summary: z.string().nullish(),
  message_at: z.number().nullable(),
  is_pinned: z.boolean().nullish(),
  share_url: z.string().nullish(),
  questions: z.array(z.string()).nullable(),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  media_url: z.string().nullish(),
  media_url_m3u8: z.string().nullish(),
  attached_link: z.string().nullish(),
  no_of_sparks: z.number().nullable(),
  is_ai_generated: z.boolean().nullish(),
  is_read: z.boolean().nullish(),
  meta_data: MetaDataSchema,
  owner: OwnerSchema,
})

const LoopVideoList = z.array(LoopVideoSchema)

export type LoopVideoListType = z.infer<typeof LoopVideoList>

export type LoopVideoType = z.infer<typeof LoopVideoSchema>

export function validateLoopVideos(data: any) {
  try {
    return LoopVideoList.parse(data)
  } catch (e) {
    console.log('error in validation::', e)
    throw new Error('Something went wrong with loop members validation!!')
  }
}
