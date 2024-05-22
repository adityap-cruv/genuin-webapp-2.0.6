import { z } from 'zod'

// Create a Zod schema for the loop object
const loopSchema = z.object({
  chat_id: z.string(),
  group: z.object({
    group_id: z.string(),
    group_name: z.string().nullish(),
    group_description: z.string().nullish(),
    color_code: z.string().nullish(),
    text_color_code: z.string().nullish(),
    dp: z.string().nullish(),
    dp_s: z.string().nullish(),
    dp_m: z.string().nullish(),
    dp_l: z.string().nullish(),
    slug: z.string().nullish(),
  }),
  settings: z
    .object({
      discoverable: z.boolean().default(false),
    })
    .nullish(),
  share_url: z.string(),
})

const BrandUserSchema = z
  .object({
    brand_id: z.number(),
    brand_slug: z.string(),
  })
  .nullish()

// Create a Zod schema for the user object
const userSchema = z.object({
  name: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  bio: z.string().nullish(),
  user_id: z.string(),
  profile_image: z.string().nullish(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  brand: BrandUserSchema.optional(),
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

// Create a Zod schema for the community object
const communitySchema = z.object({
  brand: BrandSchema.optional(),
  community_id: z.string(),
  handle: z.string(),
  slug: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  type: z.number().nullish(),
})

// Create a Zod schema for each element in the array
const SuggestionsResSchema = z.array(
  z.object({
    type: z.number().transform((val) => {
      if (val === 1) return 'video'
      if (val === 2) return 'user'
      if (val === 3) return 'community'
      if (val === 4) return 'loop'
    }),
    loop: loopSchema.nullish(),
    community: communitySchema.nullish(),
    user: userSchema.nullish(),
    match_score: z.number(),
  })
)

export function validateSuggestionsResp(data: any) {
  try {
    return SuggestionsResSchema.parse(data)
  } catch (e) {
    console.log('error::', e)
    throw new Error('Something went wrong suggestions validation.')
  }
}

const RecentsRespSchema = z.array(
  z.object({
    id: z.string(),
    type: z.number().transform((item) => {
      if (item === 1) return 'text'
      if (item === 2) return 'user'
      if (item === 3) return 'community'
      if (item === 4) return 'loop'
      if (item === 5) return 'video'
    }),
    brand_id: z.number().nullish(),
    text: z.string().nullish(),
    timestamp: z.number(),
    loop: loopSchema.nullish(),
    community: communitySchema.nullish(),
    user: userSchema.nullish(),
  })
)

export function validateRecentsResp(data: any) {
  try {
    return RecentsRespSchema.parse(data)
  } catch (e) {
    console.log('error in validation::', e)
    throw new Error('Something went wrong...')
  }
}
