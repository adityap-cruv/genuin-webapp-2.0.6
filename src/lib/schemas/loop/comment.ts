import { z } from 'zod'

const Owner = z.object({
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string().url(),
})

const Comment = z.object({
  created_at: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .nullish(),
  url: z.string().url(),
  thumbnail: z.string().url().nullish(),
  share_string: z.string(),
})

const CommentSchema = z.object({
  owner: Owner,
  comment: Comment,
})

const CommentListSchema = z.array(CommentSchema)

export type CommentType = z.infer<typeof CommentSchema>

export type CommentListType = z.infer<typeof CommentListSchema>

export function validateCommentList(data: any) {
  try {
    return CommentListSchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong with comments fetching api. Error is::' + e)
  }
}
