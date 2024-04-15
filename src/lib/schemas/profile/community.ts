import { z } from 'zod'

const VideoSchema = z.object({
  id: z.string(),
  thumbnail: z.string().nullish(),
  sparkCount: z.number().default(0),
  viewCount: z.number().default(0),
})

const LoopSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  slug: z.string(),
  private: z.boolean().default(false),
  videoCount: z.number().default(0),
  videos: z.array(VideoSchema),
})

const CommunitySchema = z.object({
  name: z.string().nullish(),
  id: z.string(),
  isJoined: z.boolean().default(false),
  handle: z.string(),
  slug: z.string(),
  profileImage: z.string().nullish(),
  loopCount: z.number().default(0),
  loops: z.array(LoopSchema),
})

export type ProfileCommunityType = z.infer<typeof CommunitySchema>

export type ProfileLoopType = z.infer<typeof LoopSchema>

export type ProfileVideoType = z.infer<typeof VideoSchema>
