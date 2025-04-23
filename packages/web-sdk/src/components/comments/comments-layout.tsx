import { Comments } from '.'
import { FeedVideoType } from '@/type'
import MentionInput from './mention-input'

type CommentsLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  videoDetails: FeedVideoType
}

const CommentsLayout = ({ videoDetails, ...props }: CommentsLayoutProps) => {
  return (
    <div
      className='flex flex-col h-full'
      {...props}>
      <p className='__gen__sdk__text__body__1 py-3 px-4 border-t border-b border-tertiary-200 border-solid sticky top-0 bg-background'>
        {`Comments (${videoDetails.video.no_of_comments})`}
      </p>

      {/* Scrollable Comments Section */}
      <div className='flex-grow overflow-y-auto'>
        <Comments
          videoId={videoDetails.uuid}
          shareUrl={videoDetails.video.share_url}
        />
      </div>

      {/* Fixed Mention Input */}
      <div className='sticky bottom-0 bg-background p-4'>
        <MentionInput
          videoId={videoDetails.video.uuid}
          loopId={videoDetails.loop.uuid}
          videoSlug={videoDetails.video.slug}
          communityId={videoDetails.community.uuid}
        />
      </div>
    </div>
  )
}

export default CommentsLayout
