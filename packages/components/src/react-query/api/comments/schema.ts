import { z } from "zod";

const ownerSchema = z.object({
  memberId: z.string(),
  name: z.string().nullish(),
  nickname: z.string(),
  bio: z.string().nullish(),
  isAvatar: z.boolean(),
  profileImage: z.string(),
});

// Define the main schema
const CommentSchema = z.object({
  owner: ownerSchema,
  chatId: z.string(),
  conversationId: z.string(),
  commentId: z.string(),
  type: z.number().transform((value) => {
    if (value === 1) {
      return "video";
    } else if (value === 2) {
      return "audio";
    } else {
      return "text";
    }
  }),
  audioUrl: z.string().nullish(),
  videoUrlM3u8: z.string().nullish(),
  thumbnail: z.string().nullish(),
  link: z.string().nullish(),
  duration: z
    .string()
    .transform((value) => Number(value))
    .nullish(),
  metaData: z
    .object({
      duration: z
        .string()
        .transform((value) => Number(value))
        .nullish(),
    })
    .nullish(),
  createdAt: z.number().nullish(),
  noOfViews: z.number(),
  isRead: z.boolean(),
  commentText: z.string().nullish(),
  commentData: z.string().nullish(),
  noOfSparks: z.number(),
  isSparked: z.boolean(),
});

const CommentListSchema = z.array(CommentSchema);

// data in which format we want
export type CommentListType = z.infer<typeof CommentListSchema>;
