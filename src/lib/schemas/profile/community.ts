import { z } from 'zod'
import { CommunityUserRoleSchema } from '../roles'

const VideoSchema = z.object({
  id: z.string(),
  thumbnail: z.string().nullish(),
  viewCount: z.number().default(0),
})

const actionsSchema = z
  .array(
    z.object({
      action_id: z.number(),
      access_type_id: z.number(),
    })
  )
  .nullish()
  .optional()

const LoopSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  slug: z.string(),
  private: z.boolean().default(false),
  videoCount: z.number().default(0),
  videos: z.array(VideoSchema),
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
  name: z.string().nullish(),
  id: z.string(),
  handle: z.string(),
  slug: z.string(),
  profileImage: z.string().nullish(),
  loopCount: z.number().default(0),
  userRole: CommunityUserRoleSchema,
  loops: z.array(LoopSchema),
  type: z.number().nullish(),
})

export type ProfileCommunityType = z.infer<typeof CommunitySchema>

export type ProfileLoopType = z.infer<typeof LoopSchema>

export type ProfileVideoType = z.infer<typeof VideoSchema>
