import { abbreviateNumber, checkAndAppendHttps, openGeneratedLink } from '@lib/utils'
import icShare from '@icons/player-controls/icShare.svg'
import icComment from '@icons/player-controls/icComment.svg'
import icLinkout from '@icons/player-controls/icLinkout.svg'
import icSpark from '@icons/player-controls/icBulb.svg'
import icSparkTrue from '@icons/player-controls/icSparkTrue.svg'
import icRepost from '@icons/player-controls/icRepost.svg'
import Link from 'next/link'
import Image from 'next/image'
import Analytics from '@services/analytics'
import { videoSpark } from '@lib/api/video'
import { useState } from 'react'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useSearchParams } from 'next/navigation'
import { RepostModal } from '@components/common/modals/repost'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { ActionItem } from './action-item'
import { useCommentSheetStore } from '../../comment-sheet/store'
import { repostDeepLink, sparkDeepLink } from '@/lib/get-deeplink'
import { useWalletBalanceHandler } from '@/services/wallet-handler'

type MobileActionsProps = {
  attachedLink?: string | null
  sparkCount: number
  videoSlug: string
  shareUrl: string
  videoId: string
  commentCount: number
  description?: string | null
  isSparked?: boolean | null | undefined
}

export function Mobile({
  attachedLink,
  shareUrl,
  sparkCount,
  videoId,
  videoSlug,
  commentCount,
  description,
  isSparked,
}: MobileActionsProps) {
  // const { shareFn } = useAdaptiveShare()
  const { handleWalletBalance } = useWalletBalanceHandler()
  const { openComments, closeComments, commentsIsOpen } = useCommentSheetStore((state) => ({
    openComments: state.openModal,
    closeComments: state.closeModal,
    commentsIsOpen: state.modalIsOpen,
  }))

  const [sparkData, setSparkData] = useState({
    isSparked,
    sparkCount,
  })
  const { embed, user } = useGenuinOptions((state) => ({ user: state.user, embed: state.embed }))
  const searchParams = Object.fromEntries(useSearchParams())

  async function toggleVideoSpark() {
    await videoSpark(videoId, 2, !sparkData.isSparked).then((res) => {
      if (res.code === 200) {
        setSparkData((prevData) => ({
          ...prevData,
          isSparked: !prevData.isSparked,
          sparkCount: prevData.isSparked ? prevData.sparkCount - 1 : prevData.sparkCount + 1,
        }))
      }
    })
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}>
      {attachedLink && (
        <Link href={checkAndAppendHttps(attachedLink)} target="_blank">
          <ActionItem title="Click Here!">
            <Image src={icLinkout} alt="link" height={32} width={32} />
          </ActionItem>
        </Link>
      )}
      <span className="flex flex-col">
        <ActionItem
          title="Repost the video!"
          onClick={async () => {
            await handleWalletBalance({ action: 'repost', videoId, type: 'POST' })
            if (embed) {
              user ? RepostModal.open(videoId) : AuthenticationModal.open()
            } else {
              await repostDeepLink({ videoSlug, shareUrl, searchParams }).then((generatedLink) => {
                openGeneratedLink(generatedLink)
              })
            }
            // DownloadDialogModal.open({ title: 'Get the Genuin app', subtitle: 'Get the app to spark the video.' })
          }}>
          <Image src={icRepost} height={32} width={32} alt="repost" />
        </ActionItem>
        <ActionItem
          title="Give spark!"
          onClick={async () => {
            await handleWalletBalance({ action: 'spark', videoId, type: 'POST' })
            embed
              ? user
                ? await toggleVideoSpark()
                : AuthenticationModal.open()
              : await sparkDeepLink({ videoSlug, shareUrl, searchParams }).then((generatedLink) => {
                  openGeneratedLink(generatedLink)
                })
          }}>
          <Image src={sparkData.isSparked ? icSparkTrue : icSpark} height={32} width={32} alt="spark" />
          <p className="flex justify-center text-body-1-demi text-monochrome-white">
            {abbreviateNumber(sparkData.sparkCount)}
          </p>
        </ActionItem>
      </span>
      <ActionItem
        title="See Comments!"
        onClick={() => {
          // TODO: USE OTHER VARIABLE FOR COMMENT OPENING
          commentsIsOpen ? closeComments() : openComments(videoId)
          void Analytics.track({
            eventName: 'RT Comment Clicked',
            properties: {
              content_category: 'loop',
              content_id: videoId,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              user_id: user?.id,
            },
          })
        }}>
        <Image src={icComment} alt="comments" height={32} width={32} />
        <p className="flex justify-center text-body-1-demi text-monochrome-white">{abbreviateNumber(commentCount)}</p>
      </ActionItem>
      <ActionItem
        title="Share Video!"
        onClick={async (e) => {
          void Analytics.track({
            eventName: 'Video Shared',
            properties: {
              content_category: 'loop',
              content_id: videoId,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              user_id: user?.id,
            },
          })
          void window.navigator.share({
            text: description ?? 'Share video.',
            title: 'Share this video',
            url: shareUrl,
          })
          e.stopPropagation()
          // void window.navigator.share({
          //   text: data.video?.description ?? '',
          //   title: 'Share this video',
          //   url: window.location.hostname + PATH_NAME.video(videoData.video.slug),
          // })
          // await shareFn({ description: shareDescription, title: shareTitle })
        }}>
        <Image src={icShare} alt="share" height={32} width={32} />
      </ActionItem>
      {/* <ActionItem
        title="more options!"
        onClick={() => {
          if (user) {
            DownloadDialogModal.open({ title: 'Get the Genuin app', subtitle: 'Get the app to report video.' })
          } else {
            AuthenticationModal.open()
          }
        }}>
        <Image src={ic3Dot} alt="more options" height={32} width={32} />
      </ActionItem> */}
    </div>
  )
}
