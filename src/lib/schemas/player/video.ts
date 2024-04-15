import { z } from 'zod'

// Define the video schema
const videoSchema = z.object({
  id: z.string(),
  createdAt: z.number().default(-1).nullish(),
  commentCount: z.number(),
  shareUrl: z.string(),
  attachedLink: z.string().nullable().optional(),
  source: z.string(),
  sparkCount: z.number(),
  thumbnail: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string(),
})

// Define the loop schema
const loopSchema = z.object({
  slug: z.string(),
  name: z.string().nullable().optional(),
  id: z.string(),
})

// Define the community schema
const communitySchema = z.object({
  profileImage: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  slug: z.string(),
  handle: z.string(),
  id: z.string(),
})

// Define the owner schema
const ownerSchema = z.object({
  isAvatar: z.boolean(),
  profileImage: z.string(),
  userName: z.string(),
  name: z.string().nullish(),
})

// Define the PlayerVideoModal schema
const PlayerVideoModalSchema = z.object({
  video: videoSchema,
  loop: loopSchema,
  community: communitySchema,
  owner: ownerSchema,
})

export type VideoPlayerModalType = z.infer<typeof PlayerVideoModalSchema>

export type VideoPlayerModalCommunityType = z.infer<typeof communitySchema>

export type VideoPlayerModalLoopType = z.infer<typeof loopSchema>
