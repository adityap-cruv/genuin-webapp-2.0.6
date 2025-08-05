/**
 * Component that handles report the video.
 */
import { MenuModal } from '../menu'
import { ActionItem } from './action-item'
import { DotIcon } from '@/components/icons/dot-icon'

type MenuActionProps = {
  /** ID of the video being reposted */
  contentId: string
  shareUrl: string
  videoSlug: string
}

export function Menu({ contentId, videoSlug, shareUrl }: MenuActionProps) {
  return (
    <ActionItem title='More'>
      <MenuModal
        contentId={contentId}
        videoSlug={videoSlug}
        shareUrl={shareUrl}>
        <div className='cursor-pointer'>
          <DotIcon />
        </div>
      </MenuModal>
    </ActionItem>
  )
}
