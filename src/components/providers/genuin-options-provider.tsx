'use client'
import { SplashScreen } from '@components/common/splash-screen'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function GenuinOptionsProvider({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) {
  const { setInitialData, isLoading } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
    isLoading: state.isLoading,
  }))
  const searchParams = useSearchParams()
  const hideNavbar = searchParams.get('hide_navbar') === '1'
  const embed = searchParams.get('embed') === '1'
  const brandId = searchParams.get('brand_id') ?? ''
  const logoUrl = searchParams.get('logo_url') ?? ''

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
    })
  }

  function handleResize() {
    setInitialData({ sizeBoxes: getSizeBoxes(isMobile, !hideNavbar) })
  }

  useEffect(() => {
    init()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (isLoading) return <SplashScreen />
  return children
}
