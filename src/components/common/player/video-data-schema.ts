import { z } from 'zod'

const VideoMetadataSchema = z.object({
  duration: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  type: z.string(),
})

const OwnerSchema = z.object({
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string().url().optional(),
  username: z.string().optional(),
})

const VideoInfoSchema = z.object({
  description: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  url: z.string().url(),
  id: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  thumbnail: z.string().url().optional(),
  share_string: z.string(),
  metadata: VideoMetadataSchema.optional(),
})

const LoopInfoSchema = z.object({
  share_string: z.string(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  profile_image: z.string().url().optional().nullable(),
  discoverable: z.boolean(),
  preview_image: z.string().url().nullable().optional(),
})

export const VideoDataSchema = z.object({
  video_type: z.enum(['rt', 'profile']),
  owner: OwnerSchema,
  video: VideoInfoSchema,
  loop: LoopInfoSchema.optional(),
})

export function validateVideoData(videoData: any) {
  try {
    VideoDataSchema.parse(videoData)
  } catch (e) {
    console.log('error::', e)
    throw new Error('parsing not done right!!!')
  }
}
