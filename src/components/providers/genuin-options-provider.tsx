'use client'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { SplashScreen } from '@components/common/splash-screen'
import { type ConfigType, useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import FingerpringJS from '@fingerprintjs/fingerprintjs'
import { useSession } from 'next-auth/react'
import { setAuthTokenInAxiosInstance } from '@lib/api/instance'

type Props = {
  children: React.ReactNode
  deviceType: string
  os: string
  browserType: string
  config?: ConfigType
}

export function GenuinOptionsProvider({ children, deviceType, os, browserType, config }: Props) {
  const { data: sessionData, status: sessionStatus } = useSession()
  const { setInitialData, isLoading } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
    isLoading: state.isLoading,
  }))
  const setDeviceId = useLocalStorage().setDeviceId

  const searchParams = useSearchParams()

  const hideNavbar = searchParams.get('hide_navbar') === '1'
  // const embed = searchParams.get('embed') === '1'
  // const brandId = searchParams.get('brand_id') ?? ''
  // const logoUrl = searchParams.get('logo_url') ?? ''
  const from = searchParams.get('from') ?? ''
  const isMobile = deviceType === 'mobile'
  const isSafari = browserType.toLowerCase().includes('safari')

  function getBox() {
    return getSizeBoxes(isMobile, !hideNavbar)
  }
  useEffect(() => {
    console.log(sessionData)
    if (sessionStatus === 'authenticated') {
      setAuthTokenInAxiosInstance(sessionData.user.accessToken)
      setInitialData({ user: sessionData.user })
    } else {
      setInitialData({ user: undefined })
      setAuthTokenInAxiosInstance(undefined)
    }
  }, [sessionStatus])

  function init() {
    const isIframe = window !== window.parent
    setInitialData({
      embed: !!config,
      logoUrl: config?.logo,
      brandId: config?.brand_id,
      showNavbar: !hideNavbar,
      isMobile,
      isLoading: false,
      sizeBoxes: getBox(),
      isIframe,
      deviceType,
      os,
      browserType,
      isSafari,
      parentUrl: from,
      config,
    })
  }

  function handleResize() {
    setInitialData({ sizeBoxes: getBox() })
  }

  function handleBlur() {
    setInitialData({ userHasFocus: false })
  }

  function handleFocus() {
    setInitialData({ userHasFocus: true })
  }

  useEffect(() => {
    init()
    const fpPromise = FingerpringJS.load()
    void (async () => {
      const fp = await fpPromise
      const result = await fp.get()
      setDeviceId(result.visitorId)
    })()

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
  return (
    <>
      {children}
      <AuthenticationModal.ui />
    </>
  )
}
