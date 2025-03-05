import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FullScreenEsc = ({ isFullScreen, toggleFullScreen }: { isFullScreen: boolean; toggleFullScreen: () => void }) => {
  const [showFullscreenMessage, setShowFullscreenMessage] = useState(false)

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
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullScreen])

  return (
    <AnimatePresence>
      {showFullscreenMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute top-20 z-20 flex w-full justify-center">
          <span className="rounded bg-monochrome-black/90 px-10 py-4 text-monochrome-white">
            To exit full screen, press <span className="rounded border border-monochrome-white p-1.5">esc</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FullScreenEsc
