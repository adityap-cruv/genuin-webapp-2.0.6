import { useEffect, memo, useState } from 'react'
import { useSizeContext } from '@/context/size'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { FeedVideoType } from '@/type'
import { cn } from '@/utils'
import { Loader } from '../loader'
import { FullScreenMobileView } from '../full-screen-view/mobile'
import { FullScreenDesktopView } from '../full-screen-view/desktop'
import { CommunityUserRole } from '../tree-structure'
import { useExpandViewContext } from '@/context/expand-view'

type PlayerModalPropsType = {
  videos?: FeedVideoType[]
  isLoading: boolean
  fetchNextPage: () => void
  open: boolean
  startIndex?: number
  closeModal?: () => void
  onCommunityRoleChanged: (communityId: string, role: CommunityUserRole) => void
  onSpark: (videoId: string, isSparked: boolean) => void
  onCommentCountChange: (videoId: string, count: number) => void
}

export const PlayerModal = memo(function PlayerModal({
  videos,
  isLoading,
  open,
  startIndex = 0,
  fetchNextPage,
  closeModal,
  onCommunityRoleChanged,
  onSpark,
  onCommentCountChange,
}: PlayerModalPropsType) {
  const { isFullScreen } = useExpandViewContext()
  const [activeIndex, setActiveIndex] = useState(startIndex)
  const { isMobile, sizeBoxes } = useSizeContext()

  useEffect(() => {
    if (!videos) return
    if (activeIndex === videos.length - 4) {
      fetchNextPage()
    }
  }, [activeIndex, videos])

  useEffect(() => {
    setActiveIndex(startIndex)
  }, [startIndex])

  return (
    <Dialog open={open}>
      <DialogContent
        style={{
          height: isFullScreen ? '100vh' : undefined,
          width: isFullScreen ? '100vw' : undefined,
        }}
        className={cn('bg-transparent p-0 flex items-center justify-center', {
          'fixed inset-0 z-50 justify-center bg-black sm:p-0 sm:w-full':
            isFullScreen,
        })}
        showClose={false}>
        {isLoading || !videos ? (
          <div className='bg-background p-6 rounded-lg'>
            <Loader className='fill-primary stroke-primary' />
          </div>
        ) : isMobile ? (
          <FullScreenMobileView
            activeIndex={activeIndex}
            closeModal={() => {
              closeModal?.()
            }}
            shouldPlay
            showNavigationBar
            sizeBox={sizeBoxes.modal ?? { width: 0, height: 0 }}
            updateActiveIndex={(newIndex) => {
              setActiveIndex(newIndex)
            }}
            videos={videos}
            forStandardWall={false}
            showClose
            onSpark={onSpark}
            onCommentCountChange={onCommentCountChange}
          />
        ) : (
          <FullScreenDesktopView
            renderedIn='FULLSCREEN'
            modalSizeBox={sizeBoxes.modal}
            shouldPlay
            videos={videos}
            activeIndex={activeIndex}
            videoSizeBox={sizeBoxes.modalVideo}
            closeModal={() => {
              closeModal?.()
            }}
            onCommunityRoleChanged={onCommunityRoleChanged}
            onSpark={onSpark}
            onCommentCountChange={onCommentCountChange}
            onActiveIndexChange={setActiveIndex}
          />
        )}
      </DialogContent>
    </Dialog>
  )
})
