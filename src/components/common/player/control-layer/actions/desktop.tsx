import { abbreviateNumber, checkAndAppendHttps, openModal } from '@lib/utils'
import icShare from '@icons/player-controls/icShare.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
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
import { usePathname, useSearchParams } from 'next/navigation'
import { ActionItem } from './action-item'
import { RepostModal } from '@components/common/modals/repost'
import { repostDeepLink, sparkDeepLink } from '@/lib/get-deeplink'

type DesktopActionsProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
  videoSlug: string
  attachedLink?: string | null
  description?: string | null
  isSparked?: boolean | null | undefined
  // /**
  //  * Determines whether repost is allowed or not.
  //  */
  // isPostAllowed: boolean
}

export function Desktop({
  shareUrl,
  sparkCount,
  videoId,
  videoSlug,
  attachedLink,
  description,
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
                await repostDeepLink({ videoSlug, shareUrl, searchParams }).then((generatedLink) => {
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
              eventName: 'Repost',
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
              eventName: 'Spark',
              properties,
            })

            if (pathname.includes('embed')) {
              window.open(shareUrl, '_blank', 'noopener,noreferrer')
            } else {
              user
                ? await toggleVideoSpark()
                : await sparkDeepLink({ videoSlug, shareUrl, searchParams }).then((generatedLink) => {
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
      </div>
    </>
  )
}
