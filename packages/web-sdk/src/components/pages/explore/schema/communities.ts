import {
  CommunityUserRole,
  reverseMapCommunityUserRole,
} from '@/components/tree-structure'
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
  /**
   * Always unjoined communities will be shown in explore page.
   * So no logged_in_user_role is coming from api we're setting it to UNJOINED.
   */
  logged_in_user_role: z
    .number()
    .int()
    .optional()
    .default(
      reverseMapCommunityUserRole(CommunityUserRole.UNJOINED).role as number,
    ),
})

const featuredCommunityListSchema = z.array(featuredCommunitySchema)

export type FeaturedCommunityType = z.infer<typeof featuredCommunitySchema>

export function parseFeaturedCommunityList(data: any) {
  try {
    return featuredCommunityListSchema.parse(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error in parsing featured community list::', e)
    throw new Error('Something went with validation!!')
  }
}
