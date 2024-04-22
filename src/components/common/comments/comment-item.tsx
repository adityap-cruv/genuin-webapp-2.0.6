import { CustomAvatar } from '@components/custom/custom-avatar'
import { useCommentStore } from './store'
import { ReadMore } from '@components/common/read-more'
import dynamic from 'next/dynamic'
import { type CommentType } from '@lib/schemas/loop/comment'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { getTimeAgo } from '@lib/utils'
import Image from 'next/image'
import icSpark from '@icons/icSparkBlack.svg'
import { DownloadDialog } from '../download-dialog'

const CommentPlayer = dynamic(async () => await import('./video-player').then((comp) => comp.CommentPlayer))
const AudioPlayer = dynamic(async () => await import('./audio-player').then((comp) => comp.AudioPlayer))

// TODO: pass data here only on need to know basis.
export function CommentItem({ comment }: { comment: CommentType }) {
  const UI = Comment[comment.type]
  return (
    <div className="flex w-full flex-col gap-y-2 py-2">
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-x-2">
          <CustomAvatar
            className="bg-slate-500 h-6 w-6 bg-red-40"
            fallbackString={comment?.owner.nickname}
            imageUrl={comment.owner?.profile_image}
            isAvatar={comment.owner.is_avatar}
          />
          <Link href={{ pathname: PATH_NAME.profile(comment.owner.nickname) }}>
            <p className="text-body-1-bold hover:underline">@{comment.owner.nickname}</p>
          </Link>
          <p className="text-cap-1-demi text-tertiary">{getTimeAgo(comment.created_at) + ' ago'}</p>
        </span>
        {/* <Image src={icMore} alt="" className="h-5 w-5" /> */}
      </span>
      <span className="h-full w-full pl-6">
        <UI comment={comment} />
        <DownloadDialog subtitle="Get app to spark this comment." title="Get the Genuin app">
          <span className="flex items-center pt-2">
            <Image src={icSpark} alt="" className="h-4 w-4" />
            <p className="text-cap-1-med">{comment.no_of_sparks}</p>
          </span>
        </DownloadDialog>
      </span>
    </div>
  )
}

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
    return <ReadMore className="break-all text-body-1-med" text={comment.comment_text} />
  },
}
