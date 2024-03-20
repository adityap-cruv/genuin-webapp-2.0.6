import { abbreviateNumber, checkAndAppendHttps, generateDeepLink, openGeneratedLink } from '@lib/utils'
import icShare from '@icons/player-controls/icShare.svg'
import icComment from '@icons/player-controls/icComment.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import icLinkout from '@icons/player-controls/icLinkout.svg'
import icSpark from '@icons/player-controls/icBulb.svg'
import icSparkTrue from '@icons/player-controls/icSparkTrue.svg'
import icRepost from '@icons/player-controls/icRepost.svg'
import ic3Dot from '@icons/player-controls/3Dot.svg'
import { type VideoDataType } from '@lib/schemas/video'
import Link from 'next/link'
import Image from 'next/image'
import { DownloadDialog } from '@components/common/download-dialog'
import { useCommentSheetStore } from '../comment-sheet/store'
import { PATH_NAME } from '@lib/utils/constants/path'
import { format } from 'url'
import { analyticsService } from '../../../../services/analytics_service'
import { videoSpark } from '@lib/api/video'
import { useState } from 'react'
import { DownloadDialogModal } from '@components/common/modals/download-app'
import { useGenuinOptions } from '@lib/stores/genuin-options'

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
  // const { shareFn } = useAdaptiveShare()
  const { openComments, closeComments, commentsIsOpen } = useCommentSheetStore((state) => ({
    openComments: state.openModal,
    closeComments: state.closeModal,
    commentsIsOpen: state.modalIsOpen,
  }))

  // TODO: Why?
  const usersdata = JSON.parse(localStorage.getItem('_user_id_') ?? '')
  const userId = usersdata.state.userId ?? ''

  if (videoData) {
    return (
      <div
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
        <span className=" flex flex-col">
          <ActionItem
            title="Repost the video!"
            onClick={() => {
              generateDeepLink({
                action: 'repost',
                contentType: 'video',
                description: ``,
                title: ``,
                previewImage: null,
                fromUserName: null,
                pathName: PATH_NAME.video(videoData.video?.slug),
                utmCampaign: 'share',
                utmMedium: 'web',
                utmSource: window.location.hostname,
                community: videoData.community.share_string,
                loop: videoData.loop.share_string,
              })
                .then((generatedLink) => {
                  openGeneratedLink(generatedLink)
                })
                .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
            }}>
            <Image src={icRepost} height={32} width={32} alt="repost" />
          </ActionItem>
          <ActionItem
            title="Give spark!"
            onClick={(e) => {
              // const url = {
              //   pathname: PATH_NAME.video(videoData.video.slug),
              //   query: {
              //     community: videoData.community.share_string,
              //     loop: videoData.loop.share_string,
              //     utm_source: 'app_web',
              //   },
              // }
              // const shareUrl = format(url)
              // void window.navigator.share({
              //   text: videoData.video?.description ?? '',
              //   title: 'Share this video',
              //   url: shareUrl,
              // })
              // e.stopPropagation()
              generateDeepLink({
                action: 'spark',
                contentType: 'video',
                description: ``,
                title: ``,
                previewImage: null,
                fromUserName: null,
                pathName: PATH_NAME.video(videoData.video?.slug),
                utmCampaign: 'share',
                utmMedium: 'web',
                utmSource: window.location.hostname,
                community: videoData.community.share_string,
                loop: videoData.loop.share_string,
              })
                .then((generatedLink) => {
                  openGeneratedLink(generatedLink)
                })
                .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
            }}>
            <Image src={icSpark} height={32} width={32} alt="spark" />
            <p className="flex justify-center text-body-1-demi text-monochrome-white">
              {videoData?.video?.no_of_sparks === null ? 0 : abbreviateNumber(videoData?.video?.no_of_sparks ?? 0)}
            </p>
          </ActionItem>
        </span>
        <ActionItem
          title="See Comments!"
          onClick={() => {
            commentsIsOpen ? closeComments() : openComments(videoData?.video?.share_string ?? '')
          }}>
          <Image src={icComment} alt="comments" height={32} width={32} />
          <p className="flex justify-center text-body-1-demi text-monochrome-white">
            {videoData?.video?.no_of_comments === null ? 0 : abbreviateNumber(videoData?.video?.no_of_comments ?? 0)}
          </p>
        </ActionItem>
        <ActionItem
          title="Share Video!"
          onClick={async (e) => {
            await analyticsService({
              eventName: 'Video Shared',
              properties: {
                content_category: 'loop',
                content_id: videoData.video?.id,
                event_record_screen: 'feed',
                event_target_screen: 'none',
                user_id: userId,
              },
            })
            const url = {
              pathname: PATH_NAME.video(videoData.video?.slug),
              query: {
                community: videoData.community.share_string,
                loop: videoData.loop.share_string,
                utm_source: 'app_web',
              },
            }
            const shareUrl = format(url)
            void window.navigator.share({
              text: videoData.video?.description ?? '',
              title: 'Share this video',
              url: shareUrl,
            })
            e.stopPropagation()
            // void window.navigator.share({
            //   text: videoData.video?.description ?? '',
            //   title: 'Share this video',
            //   url: window.location.hostname + PATH_NAME.video(videoData.video.slug),
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
  const [isSparked, setIsSparked] = useState(false)
  const [sparkCount, setSparkCount] = useState(videoData?.video?.no_of_sparks ?? 0)
  // const { openComments, closeComments, commentsIsOpen } = useCommentsStore((state) => ({
  //   openComments: state.openModal,
  //   closeComments: state.closeModal,
  //   commentsIsOpen: state.modalIsOpen,
  // }))
  const usersdata = JSON.parse(localStorage.getItem('_user_id_') ?? '')
  const userId = usersdata.state.userId ?? ''
  const user = useGenuinOptions().user

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
        <ActionItem
          title="Give spark!"
          onClick={
            user
              ? async () => {
                  await videoSpark(videoData.video?.id ?? '', 2, !isSparked)
                  setIsSparked((prevIsSparked) => !prevIsSparked)
                  setSparkCount((prevCount) => (isSparked ? prevCount - 1 : prevCount + 1))
                }
              : () => {
                  DownloadDialogModal.open({
                    title: 'Get the Genuin app',
                    subtitle: 'Get the app to spark the video.',
                  })
                }
          }>
          <Image src={isSparked ? icSparkTrue : icSpark} height={32} width={32} alt="spark" />
          <p className="flex justify-center text-body-1-demi text-monochrome-white">{abbreviateNumber(sparkCount)}</p>
        </ActionItem>
        <ActionItem
          title="Share Video!"
          onClick={async () => {
            await analyticsService({
              eventName: 'Video Shared',
              properties: {
                content_category: 'loop',
                content_id: videoData.video?.id,
                event_record_screen: 'feed',
                event_target_screen: 'none',
                user_id: userId,
              },
            })
            const url = {
              pathname: PATH_NAME.video(videoData.video?.slug),
              query: {
                community: videoData.community.share_string,
                loop: videoData.loop.share_string,
                utm_source: 'app_web',
              },
            }
            const shareUrl = window.location.hostname + format(url)
            await shareFn({
              description: shareDescription,
              title: shareTitle,
              shareLink: shareUrl,
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
