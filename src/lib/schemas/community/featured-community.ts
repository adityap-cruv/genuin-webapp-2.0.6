import { z } from 'zod'

const featuredCommunitySchema = z.object({
  community_id: z.string(),
  handle: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  color_code: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  slug: z.string(),
  text_color_code: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  no_of_members: z.number().int().nonnegative(),
})

const featuredCommunityListSchema = z.array(featuredCommunitySchema)

export function parseFeaturedCommunityList(data: any) {
  try {
    return featuredCommunityListSchema.parse(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error in parsing featured community list::', e)
    throw new Error('Something went with validation!!')
  }
}
