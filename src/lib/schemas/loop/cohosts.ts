import { z } from 'zod'

const BrandUserSchema = z.object({
  brand_id: z.number(),
  brand_slug: z.string(),
})

const CohostSchema = z.object({
  nickname: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  phone: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  member_id: z.string(),
  status: z.number().nullish(),
  role: z.number().nullish(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  brand: BrandUserSchema.optional(),
})

const CohostListSchema = z.array(CohostSchema)

export type CohostListType = z.infer<typeof CohostListSchema>

export type CohostType = z.infer<typeof CohostSchema>

export function validateLoopCohosts(data: any) {
  try {
    return CohostListSchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong with loop members validation!!')
  }
}
