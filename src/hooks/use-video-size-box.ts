import { useEffect, useState } from 'react'

export type VideoSizeBoxType = {
  width: number
  height: number
}

export function useVideoSizeBox(considerNavbar: boolean = false): VideoSizeBoxType | null {
  const [videoSizeBox, setVideoSizeBox] = useState<VideoSizeBoxType | null>(null)

  // useEffect(() => {
  //   console.log('video size box::', videoSizeBox)
  // }, [videoSizeBox])

  // function getMaxWidth(windowWidth: number) {
  //   if (windowWidth > 1400) {
  //     return windowWidth * 0.28
  //   }
  //   return windowWidth * 0.33
  // }

  useEffect(() => {
    function handleResize(event?: UIEvent) {
      const windowHeight = considerNavbar ? window.innerHeight - 74 : window.innerHeight
      const windowWidth = window.innerWidth
      let videoWidth = (windowHeight * 9) / 16

      if (videoWidth > windowWidth || windowWidth < 400) {
        videoWidth = windowWidth
      }

      setVideoSizeBox({ height: windowHeight, width: videoWidth })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return videoSizeBox
}
