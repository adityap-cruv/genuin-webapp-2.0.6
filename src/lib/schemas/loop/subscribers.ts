import { z } from 'zod'

const BrandUserSchema = z.object({
  brand_id: z.number(),
  brand_slug: z.string(),
})

const SubscriberSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  nickname: z.string(),
  bio: z.string().nullish(),
  phone: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  brand: BrandUserSchema.optional(),
})

const SubscriberListSchema = z.array(SubscriberSchema)

export type SubscriberListType = z.infer<typeof SubscriberListSchema>

export type CohostType = z.infer<typeof SubscriberSchema>

export function validateLoopSubscribers(data: any) {
  try {
    return SubscriberListSchema.parse(data)
  } catch (e) {
    console.log('error in validation::', e)
    throw new Error('Something went wrong with loop members validation!!')
  }
}
