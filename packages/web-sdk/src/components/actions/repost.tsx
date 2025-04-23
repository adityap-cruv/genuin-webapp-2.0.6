import { Analytics } from '@/analytics'
import { useAuth } from '@/context/auth'
import { useCallback } from 'react'
import { AuthenticationModal } from '../authentication'
import { getIconLink } from '@/utils'
import {
  useRepostModalContext,
  RepostModalProvider,
} from '@/components/repost/context'
import { ActionItem } from './action-item'
import { RepostModal } from '../repost'

function RepostComponent({
  videoId,
  isStandardWall,
  shareUrl,
}: {
  videoId: string
  isStandardWall: boolean
  shareUrl: string
}) {
  const { user } = useAuth()
  const { open: repostModalOpen } = useRepostModalContext()

  const handleRepostClick = useCallback(() => {
    Analytics.track(Analytics.EventNames.VideoRepost, { content_id: videoId })
    if (!isStandardWall && !user) {
      window.open(shareUrl, '_blank')
      return
    }

    if (user) {
      repostModalOpen(videoId)
    } else {
      // @ts-expect-error desc
      if (window.genuinAuth) {
        // @ts-expect-error desc
        window.genuinAuth({ path: '/', action: 'repost' })
      } else {
        AuthenticationModal.open()
      }
      return
    }
  }, [user, isStandardWall])

  return (
    <ActionItem title='Repost'>
      <img
        src={getIconLink('icRepostWhite')}
        height={32}
        width={32}
        onClick={handleRepostClick}
      />
    </ActionItem>
  )
}

export function Repost(props: {
  videoId: string
  isStandardWall: boolean
  shareUrl: string
}) {
  return (
    <RepostModalProvider>
      <RepostComponent {...props} />
      <RepostModal.ui />
    </RepostModalProvider>
  )
}
