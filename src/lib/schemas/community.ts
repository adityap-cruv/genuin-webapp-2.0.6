import { z } from 'zod'

// Define a schema for the "info" object
const infoSchema = z.object({
  handle: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  links: z.object({
    instagram_url: z.string().nullable(),
    twitter_url: z.string().nullable(),
    linkedin_url: z.string().nullable(),
    social_web_url: z.string(),
  }),
  count: z.object({
    member: z.number(),
    loop: z.number(),
    video: z.number(),
  }),
  profile_image: z.string(),
  categories: z.array(z.string()),
  share_string: z.string(),
  private: z.boolean(),
  id: z.string(),
})

// Define a schema for the "popular_loops" array
const popularLoopsSchema = z.array(
  z.object({
    subscriber_count: z.number(),
    name: z.string(),
    description: z.string(),
    share_string: z.string(),
    profile_image: z.string().nullable(),
  })
)

// Define a schema for the "leaders" array
const leadersSchema = z.array(
  z.object({
    role: z.string(),
    name: z.string().nullable(),
    nickname: z.string(),
    is_avatar: z.boolean(),
    profile_image: z.string(),
    description: z.string(),
  })
)

// Define a schema for the "members" array
const membersSchema = z.array(
  z.object({
    role: z.string(),
    name: z.string(),
    nickname: z.string(),
    is_avatar: z.boolean(),
    profile_image: z.string(),
    description: z.string().nullable(),
  })
)

const guidelineSchema = z.array(
  z.object({
    description: z.string(),
    guideline_id: z.number(),
    id: z.number(),
    position: z.number(),
    title: z.string(),
  })
)
// Define the main schema for the entire object
const CommunityDetailsSchema = z.object({
  info: infoSchema,
  guidelines: guidelineSchema,
  popular_loops: popularLoopsSchema,
  leaders: leadersSchema,
  members: membersSchema,
})

export type CommunityDetailsType = z.infer<typeof CommunityDetailsSchema>

export function validateCommunityDetails(communityDetails: any) {
  try {
    return CommunityDetailsSchema.parse(communityDetails)
  } catch (e) {
    throw new Error('parsing not done right!!!')
  }
}
