import { useFullScreenModalContext } from '@/context/full-screen'
import { FullScreenDesktopView } from '../full-screen-view/desktop'
import { FullScreenMobileView } from '../full-screen-view/mobile'
import { useBaseContext } from '@/context/base'
import { Dialog, DialogContent } from '../ui/dialog'
import { useSizeContext } from '@/context/size'
import { cn } from '@/utils'
import { useExpandViewContext } from '@/context/expand-view'

export function FullScreenModal() {
  const { isMobile, sizeBoxes } = useSizeContext()
  const { isOpen, closeFullScreenModal } = useFullScreenModalContext()
  const { activeIndex, videos, shouldPlay, updateActiveIndex, customizations } =
    useBaseContext()
  const { isFullScreen } = useExpandViewContext()

  return (
    <Dialog open={isOpen}>
      <DialogContent
        style={{
          height: isFullScreen ? '100vh' : undefined,
          width: isFullScreen ? '100vw' : undefined,
        }}
        className={cn('bg-transparent p-0 flex items-center justify-center', {
          'fixed inset-0 z-50 flex bg-black sm:p-0 sm:w-full': isFullScreen,
        })}
        showClose={false}>
        {isMobile ? (
          <FullScreenMobileView
            shouldPlay={shouldPlay === 'FULLSCREEN'}
            sizeBox={sizeBoxes.modal ?? { width: 0, height: 0 }}
            activeIndex={activeIndex}
            closeModal={closeFullScreenModal}
            showNavigationBar={customizations?.show_navigation ?? false}
            updateActiveIndex={updateActiveIndex}
            videos={videos}
            forStandardWall={false}
            showClose
          />
        ) : (
          <FullScreenDesktopView
            shouldPlay={shouldPlay === 'FULLSCREEN'}
            renderedIn='FULLSCREEN'
            modalSizeBox={sizeBoxes.modal ?? { width: 0, height: 0 }}
            videos={videos}
            activeIndex={activeIndex}
            videoSizeBox={sizeBoxes.modalVideo ?? { width: 0, height: 0 }}
            onActiveIndexChange={updateActiveIndex}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
