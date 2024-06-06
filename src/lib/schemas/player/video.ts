import { z } from 'zod'

const descriptionArrSchema = z.array(
  z
    .object({ member_id: z.string(), text: z.string() })
    .or(z.object({ community_id: z.string(), text: z.string() }))
    .or(z.string())
)
// .nullish()

export type DescriptionArrType = z.infer<typeof descriptionArrSchema>

// Define the video schema
const videoSchema = z.object({
  id: z.string(),
  createdAt: z.number().default(-1).nullish(),
  commentCount: z.number(),
  shareUrl: z.string(),
  attachedLink: z.string().nullable().optional(),
  source: z.string(),
  isSparked: z.boolean().nullable().optional(),
  sparkCount: z.number(),
  thumbnail: z.string(),
  descriptionArr: descriptionArrSchema.nullish(),
  descriptionText: z.string().nullish(),
  slug: z.string(),
})

// Define the loop schema
const loopSchema = z.object({
  slug: z.string(),
  name: z.string().nullable().optional(),
  id: z.string(),
})

const BrandSchema = z
  .object({
    brand_id: z.number(),
    name: z.string(),
    subdomain: z.string(),
    logo: z.string().nullish(),
    created_at: z.number(),
    brand_web_logo: z.string().nullish(),
    favicon: z.string().nullish(),
    brand_system_user_id: z.string(),
    brand_slug: z.string(),
  })
  .nullish()

// Define the community schema
const communitySchema = z.object({
  profileImage: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  slug: z.string(),
  handle: z.string(),
  id: z.string(),
  type: z.number().nullish(),
  shareUrl: z.string(),
  userRole: z.enum(['LEADER', 'MEMBER']).nullish(),
  brand: BrandSchema.optional(),
  isJoinRequested: z.boolean().optional(),
})

const BrandUserSchema = z
  .object({
    brand_id: z.number(),
    brand_slug: z.string(),
  })
  .nullish()

// Define the owner schema
const ownerSchema = z.object({
  isAvatar: z.boolean(),
  profileImage: z.string(),
  userName: z.string(),
  name: z.string().nullish(),
  brand: BrandUserSchema.optional(),
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
