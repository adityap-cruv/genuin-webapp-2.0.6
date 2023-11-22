import { type RefObject, useEffect, useState } from 'react'

type ReturnProps = {
  height: number
  width: number
  windowWidth: number
  windowHeight: number
}

export function useSize(elementRef: RefObject<Element | null>): ReturnProps {
  const [sizeBox, setSizeBox] = useState({ width: -1, height: -1, windowWidth: -1, windowHeight: -1 })

  function handleResize() {
    const element = elementRef.current
    if (!element) return
    setSizeBox((x) => {
      const clientRect = element.getBoundingClientRect()
      x.width = clientRect.width
      x.height = clientRect.height
      x.windowHeight = window.innerHeight
      x.windowWidth = window.innerWidth
      return { ...x }
    })
  }

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    height: sizeBox.height,
    width: sizeBox.width,
    windowWidth: sizeBox.windowWidth,
    windowHeight: sizeBox.windowHeight,
  }
}
