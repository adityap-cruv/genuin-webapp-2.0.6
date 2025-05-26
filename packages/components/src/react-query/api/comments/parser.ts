import type { CommentListType } from "./schema";
import type { CommentsResponseType } from "./type";

export function parseComments(data: CommentsResponseType): CommentListType {
  return data.map((comment) => ({
    owner: {
      memberId: comment.owner.member_id,
      nickname: comment.owner.nickname,
      isAvatar: comment.owner.is_avatar,
      profileImage: comment.owner.profile_image,
      name: comment.owner.name ?? null,
      bio: comment.owner.bio ?? null,
    },
    chatId: comment.chat_id,
    conversationId: comment.conversation_id,
    commentId: comment.comment_id,
    type:
      Number(comment.type) === 1
        ? "video"
        : Number(comment.type) === 2
          ? "audio"
          : "text",
    url: comment.url ?? null,
    videoUrlM3u8: comment.video_url_m3u8 ?? null,
    thumbnail: comment.thumbnail ?? null,
    link: comment.link ?? null,
    duration: comment.duration ? Number(comment.duration) : null,
    metaData: comment.meta_data
      ? {
          duration: comment.meta_data.duration
            ? Number(comment.meta_data.duration)
            : null,
        }
      : null,
    createdAt: comment.created_at ?? null,
    noOfViews: comment.no_of_views,
    isRead: comment.is_read,
    commentText: comment.comment_text ?? null,
    commentData: comment.comment_data ?? null,
    noOfSparks: comment.no_of_sparks,
    isSparked: comment.is_sparked,
  }));
}
