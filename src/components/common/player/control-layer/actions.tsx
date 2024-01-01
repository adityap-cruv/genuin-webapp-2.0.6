import { abbreviateNumber, checkAndAppendHttps } from '@lib/utils'
import icShare from '@icons/player-controls/icShare.svg'
import icComment from '@icons/player-controls/icComment.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import icLinkout from '@icons/player-controls/icLinkout.svg'
import icSpark from '@icons/player-controls/icBulb.svg'
import icRepost from '@icons/player-controls/icRepost.svg'
import ic3Dot from '@icons/player-controls/3Dot.svg'
import { type VideoDataType } from '@lib/schemas/video'
import Link from 'next/link'
import Image from 'next/image'
import { DownloadDialog } from '@components/common/download-dialog'
import { useCommentSheetStore } from '../comment-sheet/store'
import { PATH_NAME } from '@lib/utils/constants/path'

interface ActionsProps {
  link: string
  shareTitle: string
  videoData?: VideoDataType
  shareDescription: string
}

export const Actions = {
  mobile: Mobile,
  desktop: Desktop,
}

// TODO: Fix their is bug when text length is bigger than devicesize fix it.
function Mobile({ link = '', shareDescription = '', shareTitle = '', videoData }: ActionsProps) {
  const { shareFn } = useAdaptiveShare()
  const { openComments, closeComments, commentsIsOpen } = useCommentSheetStore((state) => ({
    openComments: state.openModal,
    closeComments: state.closeModal,
    commentsIsOpen: state.modalIsOpen,
  }))

  if (videoData) {
    return (
      <div>
        {link && (
          <Link href={checkAndAppendHttps(link)} target="_blank">
            <ActionItem title="Click Here!">
              <Image src={icLinkout} alt="link" height={32} width={32} />
            </ActionItem>
          </Link>
        )}
        <span className=" flex flex-col">
          <DownloadDialog subtitle={<>Get the app to repost this video to a loop.</>} title={<>Get the Genuin app</>}>
            <ActionItem title="Repost the video!">
              <Image src={icRepost} height={32} width={32} alt="repost" />
            </ActionItem>
          </DownloadDialog>
          <DownloadDialog title={<>Get the Genuin app.</>} subtitle={<>Get the app to give spark to this video.</>}>
            <ActionItem title="Give spark!">
              <Image src={icSpark} height={32} width={32} alt="spark" />
              <p className="flex justify-center text-body-sm text-monochrome-white">
                {videoData?.video.no_of_sparks === null ? 0 : abbreviateNumber(videoData?.video.no_of_sparks ?? 0)}
              </p>
            </ActionItem>
          </DownloadDialog>
        </span>
        <ActionItem
          title="See Comments!"
          onClick={() => {
            commentsIsOpen ? closeComments() : openComments(videoData?.video.share_string)
          }}>
          <Image src={icComment} alt="comments" height={32} width={32} />
          <p className="flex justify-center text-body-sm text-monochrome-white">
            {videoData?.video.no_of_comments === null ? 0 : abbreviateNumber(videoData?.video.no_of_comments ?? 0)}
          </p>
        </ActionItem>
        <ActionItem
          title="Share Video!"
          onClick={(e) => {
            void window.navigator.share({
              text: videoData.video?.description ?? '',
              title: 'Share this video',
              url: window.location.hostname + PATH_NAME.video(videoData.video.share_string),
            })
            e.stopPropagation()
            // void window.navigator.share({
            //   text: videoData.video?.description ?? '',
            //   title: 'Share this video',
            //   url: window.location.hostname + PATH_NAME.video(videoData.video.share_string),
            // })
            // await shareFn({ description: shareDescription, title: shareTitle })
          }}>
          <Image src={icShare} alt="share" height={32} width={32} />
        </ActionItem>
        <ActionItem title="more options!">
          <Image src={ic3Dot} alt="more options" height={32} width={32} />
        </ActionItem>
      </div>
    )
  }
}

function Desktop({ link = '', shareDescription = '', shareTitle = '', videoData }: ActionsProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  // const { openComments, closeComments, commentsIsOpen } = useCommentsStore((state) => ({
  //   openComments: state.openModal,
  //   closeComments: state.closeModal,
  //   commentsIsOpen: state.modalIsOpen,
  // }))

  if (videoData) {
    return (
      <div
        className="flex flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}>
        {link && (
          <Link href={checkAndAppendHttps(link)} target="_blank">
            <ActionItem title="Click Here!">
              <Image src={icLinkout} alt="link" height={32} width={32} />
            </ActionItem>
          </Link>
        )}
        <DownloadDialog title="Get the Genuin app" subtitle="Get the app to repost the video.">
          <ActionItem title="Repost the video!">
            <Image src={icRepost} alt="repost" height={32} width={32} />
          </ActionItem>
        </DownloadDialog>
        <DownloadDialog title="Get the Genuin app" subtitle="Get the app to give spark to video.">
          <ActionItem title="Give spark!">
            <Image src={icSpark} height={32} width={32} alt="spark" />
            <p className="flex justify-center text-body-sm text-monochrome-white">
              {videoData?.video.no_of_sparks === null ? 0 : abbreviateNumber(videoData?.video.no_of_sparks ?? 0)}
            </p>
          </ActionItem>
        </DownloadDialog>
        <ActionItem
          title="Share Video!"
          onClick={async () => {
            await shareFn({
              description: shareDescription,
              title: shareTitle,
              shareLink: window.location.hostname + PATH_NAME.video(videoData.video.share_string),
              toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
            })
          }}>
          <Image src={icShare} alt="share" height={32} width={32} />
        </ActionItem>
        <DownloadDialog title="Get the Genuin app" subtitle="Get the app to report video.">
          <ActionItem title="More options!">
            <Image src={ic3Dot} height={32} width={32} alt="More Options!" />
          </ActionItem>
        </DownloadDialog>
      </div>
    )
  }
}

interface ActionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ActionItem({ children, onClick, title }: ActionItemProps) {
  return (
    <div onClick={onClick} title={title} className="my-2 cursor-pointer">
      {children}
    </div>
  )
}
