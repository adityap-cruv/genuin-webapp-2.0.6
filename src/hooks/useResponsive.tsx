'use client'
import { useEffect, useState } from 'react'

export function useResponsive() {
  const [sizeBox, setSizeBox] = useState({ width: -1, height: -1 })
  const handleWindowSizeChange = () => {
    setSizeBox({ width: window.innerWidth, height: window.innerHeight })
  }

  useEffect(() => {
    handleWindowSizeChange()
    window.addEventListener('resize', handleWindowSizeChange)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  if (sizeBox.width === -1 || sizeBox.height === -1) return {}

  return {
    isSm: sizeBox.width >= 640,
    isMd: sizeBox.width >= 768,
    isLg: sizeBox.width >= 1024,
    isXl: sizeBox.width >= 1280,
    is2xl: sizeBox.width >= 1536,
    width: sizeBox.width,
    height: sizeBox.height,
  }
}
