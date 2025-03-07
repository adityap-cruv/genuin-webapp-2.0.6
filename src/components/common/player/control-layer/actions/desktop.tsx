import { abbreviateNumber, checkAndAppendHttps, openModal } from '@lib/utils'
import { abbreviateNumber, checkAndAppendHttps, openModal } from '@lib/utils'
import icShare from '@icons/player-controls/icon-share.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import icLinkout from '@icons/player-controls/icLinkout.svg'
import icRepost from '@icons/player-controls/icon-remix.svg'
import icComment from '@icons/player-controls/icon-comment.svg'
import Link from 'next/link'
import Image from 'next/image'
import Analytics from '@services/analytics'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { usePathname, useSearchParams } from 'next/navigation'
import { ActionItem } from './action-item'
import { RepostModal } from '@components/common/modals/repost'
import { repostDeepLink } from '@/lib/get-deeplink'
import { useWalletBalanceHandler } from '@/services/wallet-handler'
import { usePlayerControlStore } from '../../player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { Reaction } from '@/components/common/reaction'
import { useFeedListContext } from '@/components/providers/feed-provider'

type DesktopActionsProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
  videoSlug: string
  attachedLink?: string | null
  description?: string | null
  isSparked?: boolean | null | undefined
  commentCount?: number
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
  commentCount,
}: DesktopActionsProps) {
  const { updateSparkStatus } = useFeedListContext()
  const { handleWalletBalance } = useWalletBalanceHandler()
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const { brandId, user } = useGenuinOptions((state) => ({
    brandId: state.brandId,
    user: state.user,
  }))
  const pathname = usePathname()
  const searchParams = Object.fromEntries(useSearchParams())
  const { isFullScreen, toggleCommentBox } = usePlayerControlStore(
    useShallow((state) => ({
      isFullScreen: state.isFullScreen,
      toggleCommentBox: state.toggleCommentBox,
    }))
  )

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
            await handleWalletBalance({ action: 'repost', videoId, type: 'POST' })
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
        <div>
          <ActionItem>
            <Reaction
              isSparked={isSparked ?? false}
              sparkCount={sparkCount}
              contentId={videoId}
              shareUrl={shareUrl}
              videoSlug={videoSlug}
              showSparkCount={false}
              onSparkChange={(isSparked) => {
                updateSparkStatus(videoId, isSparked)
              }}
            />
          </ActionItem>
          <p className="flex justify-center text-body-1-demi text-monochrome-white">
            {abbreviateNumber(sparkCount < 0 ? 0 : sparkCount)}
          </p>
        </div>
        {isFullScreen && (
          <div>
            <ActionItem
              title="See Comments!"
              onClick={() => {
                toggleCommentBox()
              }}>
              <Image src={icComment} alt="comments" height={32} width={32} />
            </ActionItem>
            <p className="flex justify-center text-body-1-demi text-monochrome-white">
              {abbreviateNumber(commentCount ?? 0)}
            </p>
          </div>
        )}
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
