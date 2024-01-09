import { useEffect, useState } from 'react'

type VideoSizeBoxType = {
  modal: {
    width: number
    height: number
  }
  video: {
    width: number
    height: number
  }
}

export function useVideoSizeBoxModal() {
  const [box, setBox] = useState<VideoSizeBoxType>({
    modal: { height: -1, width: -1 },
    video: { height: -1, width: -1 },
  })

  function resizeHandler() {
    if (!window) return
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const playerHeight = windowHeight * 0.9
    const playerWidth = playerHeight * (9 / 16)
    const modalWidth = playerWidth * 2

    setBox((x) => {
      x.modal.height = playerHeight
      x.modal.width = modalWidth
      x.video.height = playerHeight
      x.video.width = playerWidth
      return { ...x }
    })
  }

  useEffect(() => {
    resizeHandler()
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  if (box.modal.height === -1) return
  return box
}
