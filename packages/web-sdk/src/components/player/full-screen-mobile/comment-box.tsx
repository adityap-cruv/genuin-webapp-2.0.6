import { Comments, CommentInputBox } from '@/components/comments'
import { getIconLink } from '@/utils'
import { useBaseContext } from '@/context/base'
import MentionInput from '@/components/comments/mention-input'

type CommentBoxComponentPropsType = {
  videoId: string
  shareUrl: string
  noOfComments: number
  loopId: string
  videoSlug: string
  communityId: string
  close: () => void
  videoUrl: string
}

export function CommentBox({
  videoId,
  close,
  videoUrl,
  videoSlug,
  communityId,
  loopId,
  noOfComments,
  shareUrl,
}: CommentBoxComponentPropsType) {
  const { customizations } = useBaseContext()
  if (!customizations?.is_enable_engagement_tools) return
  return (
    <div
      className='__gen__sdk__animate__comment__box__from__bottom fixed bottom-0 z-10 bg-background w-full h-[90%] rounded-t-2xl overflow-clip'
      onClick={(e) => {
        e.stopPropagation()
      }}>
      <div className='h-full overflow-auto'>
        <div className='py-3 px-4 sticky border-b top-0 z-10 flex justify-between items-center bg-background text-tertiary'>
          <p className='__gen__sdk__text__body__1 text-tertiary'>{`Comments (${noOfComments})`}</p>
          <img
            alt='close'
            onClick={close}
            src={getIconLink('icCloseGray')}
            height={24}
            width={24}
          />
        </div>
        <Comments
          videoId={videoId}
          shareUrl={shareUrl}
        />
      </div>
      <MentionInput
        videoId={videoId}
        loopId={loopId}
        videoSlug={videoSlug}
        communityId={communityId}
      />
    </div>
  )
}
