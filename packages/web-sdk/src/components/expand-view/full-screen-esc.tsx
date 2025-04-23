import { useEffect, useState } from 'react'
// import Analytics from '@/services/analytics'

const FullScreenEsc = ({
  toggleFullScreen,
  videoId,
}: {
  isFullScreen: boolean
  toggleFullScreen: (video_id?: string) => void
  videoId: string
}) => {
  const [showFullscreenMessage, setShowFullscreenMessage] = useState(false)

  useEffect(() => {
    setShowFullscreenMessage(true)
    const timer = setTimeout(() => {
      setShowFullscreenMessage(false)
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleFullScreen(videoId)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (showFullscreenMessage)
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

export default FullScreenEsc
