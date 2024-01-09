import { useEffect, useState } from 'react'
import { type VideoSizeBoxType } from './use-video-size-box'

export function useVideoSizeBoxMobile() {
  const [sizeBox, setSizeBox] = useState<VideoSizeBoxType>({ height: -1, width: -1 })

  useEffect(() => {
    setSizeBox((x) => {
      x.height = window.innerHeight
      x.width = window.innerWidth
      return { ...x }
    })
  }, [])

  if (sizeBox.height === -1) return
  return sizeBox
}
