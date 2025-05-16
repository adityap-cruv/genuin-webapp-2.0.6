type Community = {
  community_id: string
  handle: string
  name: string
  description: string | null
  color_code: string
  slug: string
  text_color_code: string
  dp: string | null
  dp_s: string | null
  dp_m: string | null
  dp_l: string | null
}

type User = {
  name: string
  nickname: string
  is_avatar: boolean
  bio: string | null
  is_brand_system_user?: boolean
  brand?: {
    brand_id: number
    brand_slug: string
  }
  member_id: string
  profile_image: string | null
  profile_image_s: string | null
  profile_image_m: string | null
  profile_image_l: string | null
}

export type CommentMention = {
  type: number
  community?: Community
  user?: User
  match_score: number
}

export type SelectedMention = {
  handle: string
  id: string | number
  slug?: string
  type: 'member' | 'community' | 'url'
}

import { z } from 'zod'

const ownerSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  nickname: z.string(),
  bio: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
})

// Define the main schema
const CommentSchema = z.object({
  owner: ownerSchema,
  chat_id: z.string(),
  conversation_id: z.string(),
  comment_id: z.string(),
  type: z.number().transform((value) => {
    if (value === 1) {
      return 'VIDEO'
    } else if (value === 2) {
      return 'AUDIO'
    } else {
      return 'TEXT'
    }
  }),
  url: z.string().nullish(),
  video_url_m3u8: z.string().nullish(),
  thumbnail: z.string().nullish(),
  link: z.string().nullish(),
  duration: z
    .string()
    .transform((value) => Number(value))
    .nullish(),
  meta_data: z
    .object({
      duration: z
        .string()
        .transform((value) => Number(value))
        .nullish(),
    })
    .nullish(),
  created_at: z.number().nullish(),
  no_of_views: z.number(),
  is_read: z.boolean(),
  comment_text: z.string().nullish(),
  comment_data: z.string().nullish(),
  no_of_sparks: z.number(),
  is_sparked: z.boolean(),
})

const CommentListSchema = z.array(CommentSchema)

export type CommentType = z.infer<typeof CommentSchema>

export type CommentListType = z.infer<typeof CommentListSchema>

export function validateCommentDetails(data: any) {
  try {
    return CommentSchema.parse(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error in parsing comment list::', e)
    throw new Error(
      'Something went wrong with comments fetching api. Error is::',
      e as ErrorOptions | undefined,
    )
  }
}

export function validateCommentList(data: any) {
  try {
    return CommentListSchema.parse(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error in parsing comment list::', e)
    throw new Error(
      'Something went wrong with comments fetching api. Error is::',
      e as ErrorOptions | undefined,
    )
  }
}
