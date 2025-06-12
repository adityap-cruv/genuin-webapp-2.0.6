/**
 * Component that handles report the video.
 */
import { ActionItem } from './action-item'
import icDots from '@icons/player-controls/3Dot.svg'
import Image from 'next/image'
import { MenuModal } from '@/components/common/modals/menu'

type MenuActionProps = {
  /** ID of the video being reposted */
  contentId: string
  shareUrl: string
  videoSlug: string
}

export function MenuAction({ contentId, videoSlug, shareUrl }: MenuActionProps) {
  return (
    <ActionItem className="relative" title="More">
      <MenuModal contentId={contentId} videoSlug={videoSlug} shareUrl={shareUrl}>
        <Image src={icDots} alt="report" height={32} width={32} />
      </MenuModal>
    </ActionItem>
  )
}
