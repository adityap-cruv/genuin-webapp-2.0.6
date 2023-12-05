import { z } from 'zod'

const ownerSchema = z.object({
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
})

const commentSchema = z.object({
  created_at: z.string(),
  type: z.enum(['video', 'audio', 'text']),
  text: z.string().nullable(),
  no_of_sparks: z.number(),
  url: z.string().nullable(),
  thumbnail: z.string().nullable(),
  share_string: z.string(),
})

const CommentSchema = z.object({
  owner: ownerSchema,
  comment: commentSchema,
})

const CommentListSchema = z.array(CommentSchema)

export type CommentType = z.infer<typeof CommentSchema>

export type CommentListType = z.infer<typeof CommentListSchema>

export function validateCommentList(data: any) {
  try {
    return CommentListSchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong with comments fetching api. Error is::', e as ErrorOptions | undefined)
  }
}
