import { abbreviateNumber, checkAndAppendHttps, openGeneratedLink, openModal } from '@lib/utils'
import icShare from '@icons/player-controls/icShare.svg'
import icComment from '@icons/player-controls/icComment.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import icLinkout from '@icons/player-controls/icLinkout.svg'
import icSpark from '@icons/player-controls/icBulb.svg'
import icSparkTrue from '@icons/player-controls/icSparkTrue.svg'
import icRepost from '@icons/player-controls/icRepost.svg'
import Link from 'next/link'
import Image from 'next/image'
import { useCommentSheetStore } from '../comment-sheet/store'
import Analytics from '@services/analytics'
import { videoSpark } from '@lib/api/video'
import { useState } from 'react'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { usePathname, useSearchParams } from 'next/navigation'
import { RepostModal } from '@components/common/modals/repost'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { repostDeepLink, sparkDeepLink } from '@/lib/get-deeplink'

export const Actions = {
  mobile: Mobile,
  desktop: Desktop,
}

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

function Mobile({
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
          await Analytics.track({
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

type DesktopActionsProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
  attachedLink?: string | null
  description?: string | null
  videoSlug?: string
  isSparked?: boolean | null | undefined
  // /**
  //  * Determines whether repost is allowed or not.
  //  */
  // isPostAllowed: boolean
}

function Desktop({
  shareUrl,
  sparkCount,
  videoId,
  attachedLink,
  description,
  videoSlug,
  isSparked, // isPostAllowed,
}: DesktopActionsProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const [sparkData, setSparkData] = useState({
    isSparked,
    sparkCount,
  })
  const { brandId, user } = useGenuinOptions((state) => ({
    brandId: state.brandId,
    user: state.user,
  }))
  const pathname = usePathname()
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
    <>
      <div
        className="flex flex-col"
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
        <ActionItem
          title="Repost the video!"
          onClick={async () => {
            if (pathname.includes('embed')) {
              window.open(shareUrl, '_blank', 'noopener,noreferrer')
            } else {
              if (user) {
                RepostModal.open(videoId)
              } else {
                await repostDeepLink({ videoSlug: videoSlug ?? '', shareUrl, searchParams }).then((generatedLink) => {
                  openModal({ deepLink: generatedLink, subtitle: 'Get the app to repost the video.' })
                })
              }
            }

            const properties = {
              content_category: 'loop',
              content_id: videoId,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              user_id: user?.id,
            }
            if (pathname.includes('embed')) {
              Object.assign(properties, {
                brand_id: brandId,
              })
            }
            void Analytics.track({
              eventName: 'repost',
              properties,
            })
          }}>
          <Image src={icRepost} alt="repost" height={32} width={32} />
        </ActionItem>
        <ActionItem
          title="Give spark!"
          onClick={async () => {
            const properties = {
              content_category: 'loop',
              content_id: videoId,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              user_id: user?.id,
            }
            if (pathname.includes('embed')) {
              Object.assign(properties, {
                brand_id: brandId,
              })
            }
            void Analytics.track({
              eventName: 'spark',
              properties,
            })

            if (pathname.includes('embed')) {
              window.open(shareUrl, '_blank', 'noopener,noreferrer')
            } else {
              user
                ? await toggleVideoSpark()
                : await sparkDeepLink({ videoSlug: videoSlug ?? '', shareUrl, searchParams }).then((generatedLink) => {
                    openModal({ deepLink: generatedLink, subtitle: 'Get the app to spark the video.' })
                  })
            }
          }}>
          <Image src={sparkData.isSparked ? icSparkTrue : icSpark} height={32} width={32} alt="spark" />
          <p className="flex justify-center text-body-1-demi text-monochrome-white">
            {abbreviateNumber(sparkData.sparkCount)}
          </p>
        </ActionItem>
        <ActionItem
          title="Share Video!"
          onClick={async () => {
            if (pathname.includes('embed')) {
              window.open(shareUrl, '_blank', 'noopener,noreferrer')
            } else {
              await shareFn({
                description: description ?? '',
                title: description ?? '',
                shareLink: shareUrl,
                toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
              })
            }

            const properties = {
              content_category: 'loop',
              content_id: videoId,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              user_id: user?.id,
            }
            if (pathname.includes('embed')) {
              Object.assign(properties, {
                brand_id: brandId,
              })
            }
            void Analytics.track({
              eventName: 'Video Shared',
              properties,
            })
          }}>
          <Image src={icShare} alt="share" height={32} width={32} />
        </ActionItem>
        {/* <ActionItem
          title="More options!"
          onClick={() => {
            if (user) {
              DownloadDialogModal.open({ title: 'Get the Genuin app', subtitle: 'Get the app to report video.' })
            } else {
              AuthenticationModal.open()
            }
          }}>
          <Image src={ic3Dot} height={32} width={32} alt="More Options!" />
        </ActionItem> */}
      </div>
    </>
  )
}

interface ActionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ActionItem({ children, onClick, title, ...props }: ActionItemProps) {
  return (
    <div onClick={onClick} title={title} className="my-2 cursor-pointer" {...props}>
      {children}
    </div>
  )
}
