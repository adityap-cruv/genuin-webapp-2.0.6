import { CustomAvatar } from '@components/custom/custom-avatar'
import { useCommentStore } from './store'
import { ReadMore } from '@components/common/read-more'
import dynamic from 'next/dynamic'
import { type CommentType } from '@lib/schemas/loop/comment'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { getTimeAgo } from '@lib/utils'
import { Reaction } from '../reaction'
import { memo } from 'react'

const CommentPlayer = dynamic(async () => await import('./video-player').then((comp) => comp.CommentPlayer))
const AudioPlayer = dynamic(async () => await import('./audio-player').then((comp) => comp.AudioPlayer))

type CommentItemPropsType = {
  comment: CommentType
  videoShareUrl: string
  slug: string
  onCommentReactionChange: (isSparked: boolean) => void
}

export const CommentItem = memo(function CommentItem({
  comment,
  videoShareUrl,
  slug,
  onCommentReactionChange,
}: CommentItemPropsType) {
  const UI = Comment[comment.type]
  return (
    <div className="flex w-full flex-col gap-y-0.5 py-2 last:pb-20">
      <div className="flex items-center gap-2">
        <CustomAvatar
          className="bg-slate-500 h-6 w-6 bg-red-40"
          fallbackString={comment?.owner.nickname}
          imageUrl={comment.owner?.profile_image}
          isAvatar={comment.owner.is_avatar}
        />
        <Link href={{ pathname: PATH_NAME.profile(comment.owner.nickname) }}>
          <p className="line-clamp-1 break-all text-body-1-bold">@{comment.owner.nickname}</p>
        </Link>
        <p className="shrink-0 text-cap-1-demi text-tertiary">{getTimeAgo(comment.created_at) + ' ago'}</p>
      </div>
      <div className="h-full w-full pl-8">
        <UI comment={comment} />
        <Reaction
          isSparked={comment.is_sparked ?? false}
          shareUrl={videoShareUrl}
          className="w-fit flex-row gap-1 pt-2 !text-secondary [&_p]:!text-cap-1-med"
          sparkCount={comment.no_of_sparks}
          contentId={comment.comment_id}
          videoSlug={slug}
          iconHeight={16}
          iconWidth={16}
          forComment
          onSparkChange={(newSparkStatus) => {
            onCommentReactionChange(newSparkStatus)
          }}
        />
      </div>
    </div>
  )
})

const Comment = {
  video({ comment }: { comment: CommentType }) {
    const setActiveCommentIndex = useCommentStore((state) => state.setActiveCommentIndex)
    const activeCommentIndex = useCommentStore((state) => state.activeCommentIndex)
    if (comment)
      return (
        <CommentPlayer
          videoSource={comment.video_url_m3u8 ?? comment.url ?? ''}
          poster={comment.thumbnail ?? ''}
          commentShareString={comment.comment_id}
          onClick={() => {
            if (activeCommentIndex === comment.comment_id) {
              // if activeCommentIndex and share_string same than it will pause the video.
              setActiveCommentIndex('')
            } else {
              setActiveCommentIndex(comment.comment_id)
            }
          }}
        />
      )
  },
  audio({ comment }: { comment: CommentType }) {
    const setActiveCommentIndex = useCommentStore((state) => state.setActiveCommentIndex)
    const activeCommentIndex = useCommentStore((state) => state.activeCommentIndex)
    return (
      <AudioPlayer
        commentShareString={comment.comment_id}
        url={comment.url ?? ''}
        onClick={() => {
          if (activeCommentIndex === comment.comment_id) {
            setActiveCommentIndex('')
          } else {
            setActiveCommentIndex(comment.comment_id)
          }
        }}
      />
    )
  },
  text({ comment }: { comment: CommentType }) {
    if (comment.comment_data)
      return (
        <ReadMore.dynamic position="outside" className="text-body-1-med" text={comment.comment_data} maxLines={2} />
      )
  },
}
