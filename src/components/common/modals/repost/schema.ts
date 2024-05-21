import { z } from 'zod'

const Group = z.object({
  group_id: z.string(),
  group_name: z.string().nullish(),
  group_description: z.string().nullish(),
  tags: z.string().nullish(),
})

const Action = z.object({
  action_id: z.number(),
  access_type_id: z.number(),
})

const Chat = z.object({
  id: z.number(),
  chat_id: z.string(),
  type: z.number(),
  slug: z.string(),
  group: Group,
  actions: z.array(Action),
})

const Brand = z.object({
  brand_id: z.number(),
  name: z.string().nullish(),
  subdomain: z.string(),
  logo: z.string(),
  created_at: z.number(),
  brand_web_logo: z.string(),
  favicon: z.string(),
  brand_system_user_id: z.string(),
  brand_slug: z.string(),
})

const CommunitySchema = z.object({
  community_id: z.string(),
  handle: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  dp: z.string().nullish(),
  color_code: z.string().nullish(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
  slug: z.string(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  text_color_code: z.string().nullish(),
  chats: z.array(Chat),
  brand: Brand,
  type: z.number().transform((item) => {
    return item === 1 ? 'PUBLIC' : 'PRIVATE'
  }),
})

const CommunityListSchema = z.array(CommunitySchema)

export type RepostCommunityType = z.infer<typeof CommunitySchema>

export type RepostCommunityListType = z.infer<typeof CommunityListSchema>

export function validateRepostCommunityListData(data: any) {
  try {
    return CommunityListSchema.parse(data)
  } catch (e) {
    console.log('error i validation of repost api data::', e)
    throw new Error('Something went wrong::')
  }
}
