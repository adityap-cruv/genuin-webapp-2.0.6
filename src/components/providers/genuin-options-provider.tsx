'use client'
import { SplashScreen } from '@components/common/splash-screen'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
  deviceType: string
  os: string
  browserType: string
}

export function GenuinOptionsProvider({ children, deviceType, os, browserType }: Props) {
  const { setInitialData, isLoading } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
    isLoading: state.isLoading,
  }))
  const searchParams = useSearchParams()

  const hideNavbar = searchParams.get('hide_navbar') === '1'
  const embed = searchParams.get('embed') === '1'
  const brandId = searchParams.get('brand_id') ?? ''
  const logoUrl = searchParams.get('logo_url') ?? ''
  const isMobile = deviceType === 'mobile'
  const isSafari = browserType.toLowerCase().includes('safari')

  function init() {
    setInitialData({
      brandId,
      embed,
      logoUrl,
      showNavbar: !hideNavbar,
      isMobile,
      isLoading: false,
      sizeBoxes: getSizeBoxes(isMobile, !hideNavbar),
      isIframe: window !== window.parent,
      deviceType,
      os,
      browserType,
      isSafari,
    })
  }

  function handleResize() {
    setInitialData({ sizeBoxes: getSizeBoxes(isMobile, !hideNavbar) })
  }

  function handleBlur() {
    setInitialData({ userHasFocus: false })
  }

  function handleFocus() {
    setInitialData({ userHasFocus: true })
  }

  useEffect(() => {
    init()

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  if (isLoading) return <SplashScreen />
  return children
}
