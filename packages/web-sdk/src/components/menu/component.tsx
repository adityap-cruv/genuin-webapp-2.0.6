import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Menu } from './menu'
import { cn } from '@/utils'
import { useMenuContext } from './context'
import { memo, useEffect } from 'react'
import { useBaseContext } from '@/context/base'
import { ReportProvider } from '../report/context'
import { Report } from '../report'
import { PlaybackModal } from '../playback/modal'

export const Component = memo(function Component({
  children,
}: {
  children: React.ReactNode
}) {
  const { modalType, changeModalType } = useMenuContext()
  const { setIsVideoPlaying, setPlayingState } = useBaseContext()

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const renderContent = () => {
    switch (modalType) {
      case 'menu':
        return <Menu />
      case 'report':
        return (
          <ReportProvider>
            <Report />
          </ReportProvider>
        )
      case 'playBackSpeed':
        return <PlaybackModal />
      default:
        return null
    }
  }

  useEffect(() => {
    if (modalType === null) return
    window.addEventListener('keydown', handleKeyDown, true)
    setIsVideoPlaying(false) // Pause video when modal is opened
    setPlayingState('paused')
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      setIsVideoPlaying(true) // Pause video when modal is opened
      setPlayingState('playing')
    }
  }, [modalType, setPlayingState, setIsVideoPlaying])

  return (
    <Dialog
      modal
      open={modalType != null}
      onOpenChange={(open) => {
        if (open) {
          changeModalType('menu')
        } else {
          setTimeout(() => {
            changeModalType(null)
          }, 200)
        }
      }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* <DialogPortal> */}
      <DialogContent
        showClose={modalType !== 'menu'}
        className={cn(
          'p-0 sm:p-0 duration-0',
          modalType === 'menu'
            ? 'left-1/4 top-1/2 h-fit w-1/2 transform -translate-y-1/2 rounded-2xl md:w-fit'
            : 'left-0 top-auto rounded-t-2xl md:rounded-2xl',
        )}>
        {renderContent()}
      </DialogContent>
      {/* </DialogPortal> */}
    </Dialog>
  )
})
