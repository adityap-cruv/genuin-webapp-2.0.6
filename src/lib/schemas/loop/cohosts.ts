import { z } from 'zod'

// Define a schema for a member object
const MemberSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  nickname: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  phone: z.string(),
  is_avatar: z.boolean(),
  chat_limit: z.number(),
  profile_image: z.string().nullish(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  status: z.number(),
  role: z.number(),
})

// Define a schema for a subscriber object
const SubscriberSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  nickname: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  phone: z.string(),
  is_avatar: z.boolean(),
  chat_limit: z.number(),
  profile_image: z.string().nullish(),
})

// Define a schema for the main object
const LoopMembersSchema = z.object({
  members: z.array(MemberSchema),
  subscribers: z.array(SubscriberSchema),
  chat_id: z.string(),
  type: z.number(),
})

export type LoopMembersType = z.infer<typeof LoopMembersSchema>

export function validateLoopCohosts(data: any) {
  try {
    return LoopMembersSchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong with loop members validation!!')
  }
}
