import { z } from "zod";

const ownerSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  nickname: z.string(),
  bio: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
});

// Define the main schema
const CommentSchema = z.array(
  z.object({
    owner: ownerSchema,
    chat_id: z.string(),
    conversation_id: z.string(),
    comment_id: z.string(),
    type: z.number().transform((value) => {
      if (value === 1) {
        return "video";
      } else if (value === 2) {
        return "audio";
      } else {
        return "text";
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
);

// api response type
export type CommentsResponseType = z.infer<typeof CommentSchema>;
