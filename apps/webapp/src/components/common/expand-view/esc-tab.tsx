import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'
import { useShallow } from 'zustand/react/shallow'

const ExpandViewEsc = ({ videoId }: { videoId: string }) => {
  const [showFullscreenMessage, setShowFullscreenMessage] = useState(false)
  const { isFullScreen, toggleFullScreen } = usePlayerControlStore(
    useShallow((state) => ({
      isFullScreen: state.isFullScreen,
      toggleFullScreen: state.toggleFullScreen,
    }))
  )

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
        toggleFullScreen()
        void Analytics.track({
          eventName: 'Video Minimized',
          properties: {
            video_id: videoId,
          },
        })
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullScreen])

  if (!isFullScreen) return

  return (
    <AnimatePresence>
      {showFullscreenMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute top-20 z-20 flex w-full justify-center">
          <span className="bg-monochrome-black/90 text-monochrome-white rounded px-10 py-4">
            To exit full screen, press <span className="border-monochrome-white rounded border p-1.5">esc</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExpandViewEsc
