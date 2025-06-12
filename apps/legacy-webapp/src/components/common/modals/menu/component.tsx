import { Dialog, DialogContent, DialogPortal, DialogTrigger } from '@/components/ui/dialog'
import { Menu } from './menu'
import { cn } from '@/lib/utils'
import React, { lazy, useEffect, useState, Suspense } from 'react'
import { useMenuContext } from './context'
import { usePlayerControlStore } from '../../player/player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { Loader } from '@/components/ui/loader'
import { ReportProvider } from '../report/context'

// Lazy load the PlaybackModal
const LazyPlaybackModal = lazy(
  async () =>
    await import('../../playback/modal').then((module) => ({
      default: module.PlaybackModal,
    }))
)

export function Component({ children }: { children: React.ReactNode }) {
  const { modalType, changeModalType } = useMenuContext()
  const { user, config } = useGenuinOptions()
  const [Report, setReport] = useState<React.ComponentType>()

  const { pause, play } = usePlayerControlStore(
    useShallow((state) => ({
      pause: state.pause,
      play: state.play,
    }))
  )

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  useEffect(() => {
    if (!user?.isBrandSystemUser) {
      import('@/components/common/modals/report')
        .then((mod) => {
          setReport(() => mod.Report) // Assuming default export
        })
        .catch((err) => {
          console.error('Failed to load report modal:', err)
        })
    }
  }, [user])

  const renderContent = () => {
    switch (modalType) {
      case 'menu':
        return <Menu />
      case 'report':
        return Report ? (
          <ReportProvider>
            <Report />
          </ReportProvider>
        ) : (
          <Loader />
        )
      case 'playBackSpeed':
        if (config.web_configs?.playback_speed_enabled) {
          return (
            <Suspense fallback={<Loader />}>
              <LazyPlaybackModal />
            </Suspense>
          )
        }
        return null
      default:
        return null
    }
  }

  useEffect(() => {
    if (modalType === null) return
    window.addEventListener('keydown', handleKeyDown, true) // Add keydown listener when modal is open
    pause() // Pause video when modal is opened
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true) // Cleanup on modal close (remove keydown listener and play video)
      play()
    }
  }, [modalType, pause, play])

  return (
    <Dialog
      open={modalType != null}
      modal
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
      <DialogPortal>
        <DialogContent
          showClose={modalType !== 'menu'}
          className={cn(
            '!p-0 duration-0',
            modalType === 'menu'
              ? 'left-1/4 top-1/2 mx-auto h-fit w-1/2 -translate-y-1/2 transform rounded-2xl md:w-fit'
              : 'left-0 top-auto rounded-t-2xl md:rounded-2xl'
          )}>
          {renderContent()}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
