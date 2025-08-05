import { useEffect, useState } from 'react'
import { useExpandViewContext } from './context'
// import Analytics from '@/services/analytics'

export const ExpandViewEsc = ({
  videoId,
  onCloseExpandView,
}: {
  videoId: string
  onCloseExpandView?: () => void
}) => {
  const [showFullscreenMessage, setShowFullscreenMessage] = useState(false)
  const { toggleFullScreen, isFullScreen, isBrowserFullscreen } = useExpandViewContext()

  useEffect(() => {
    if (isFullScreen) {
      setShowFullscreenMessage(true)
      const timer = setTimeout(() => {
        setShowFullscreenMessage(false)
      }, 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [isFullScreen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        event.stopPropagation()
        event.preventDefault()
        onCloseExpandView?.()
        toggleFullScreen(videoId)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullScreen])

  if (!isFullScreen) return

  if (showFullscreenMessage && !isBrowserFullscreen)
    return (
      <div className='absolute top-20 z-20 flex w-full justify-center'>
        <span className='rounded bg-black/90 px-10 py-4 text-white'>
          To exit full screen, press{' '}
          <span className='rounded border border-white p-1.5 text-white'>
            esc
          </span>
        </span>
      </div>
    )
}
