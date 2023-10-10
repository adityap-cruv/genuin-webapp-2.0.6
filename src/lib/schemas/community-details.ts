import { z } from 'zod'

// Define a schema for the "info" object
const infoSchema = z.object({
  handle: z.string(),
  name: z.string(),
  description: z.string(),
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

// Define a schema for the "moderators" array
const moderatorsSchema = z.array(
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

// Define the main schema for the entire object
export const CommunityDetailsSchema = z.object({
  info: infoSchema,
  popular_loops: popularLoopsSchema,
  moderators: moderatorsSchema,
  members: membersSchema,
})

export function validateCommunityDetails(communityDetails: any) {
  try {
    return CommunityDetailsSchema.parse(communityDetails)
  } catch (e) {
    throw new Error('parsing not done right!!!')
  }
}
