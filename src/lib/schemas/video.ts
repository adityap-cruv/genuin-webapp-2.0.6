import { z } from 'zod'

const VideoMetadataSchema = z.object({
  duration: z.number().nullish(),
  height: z.number().nullish(),
  width: z.number().nullish(),
  type: z.string(),
})

const OwnerSchema = z.object({
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string().url().optional(),
  username: z.string().optional(),
})

const VideoInfoSchema = z.object({
  description: z.string().nullish(),
  link: z.string().nullish(),
  url: z.string().url(),
  id: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  thumbnail: z.string().url().optional(),
  share_string: z.string(),
  metadata: VideoMetadataSchema.optional(),
  view_count: z.number().nullish(),
  reply_count: z.number().nullish(),
  no_of_sparks: z.number().nullish(),
  no_of_comments: z.number().nullish(),
})

const LoopInfoSchema = z.object({
  share_string: z.string(),
  name: z.string().optional(),
  description: z.string().nullish(),
  profile_image: z.string().url().nullish(),
  discoverable: z.boolean().optional(), // todo remove it from api.
  preview_image: z.string().url().nullish(),
})

const VideoDataSchema = z.object({
  video_type: z.enum(['rt', 'public_video']).optional(),
  owner: OwnerSchema,
  video: VideoInfoSchema,
  loop: LoopInfoSchema.optional(),
})

const VideoDataListSchema = z.array(VideoDataSchema)

export type VideoDataType = z.infer<typeof VideoDataSchema>

export type VideoDataListType = z.infer<typeof VideoDataListSchema>

export function validateVideoData(videoData: any) {
  try {
    return VideoDataSchema.parse(videoData)
  } catch (e) {
    throw new Error('parsing video data went wrong.')
  }
}

export function validateVideoListData(videoListData: any) {
  try {
    return VideoDataListSchema.parse(videoListData)
  } catch (e) {
    throw new Error('parsing array of video went wrong.')
  }
}
