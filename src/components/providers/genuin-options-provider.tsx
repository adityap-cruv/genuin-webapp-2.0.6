'use client'
import { SplashScreen } from '@components/common/splash-screen'
import { type ConfigType, useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import FingerpringJS from '@fingerprintjs/fingerprintjs'
import { useSession } from 'next-auth/react'
import {} from '@components/common/modals/download-app'
import { axiosInstance, setAuthTokenInAxiosInstance } from '@lib/api/instance'
import { encryptText, parseUserAgent } from '@lib/utils'
import dynamic from 'next/dynamic'

const AuthenticationModal = dynamic(
  async () => await import('@components/common/modals/authentication').then((comp) => comp.AuthenticationModal.ui)
)
const DownloadDialogModal = dynamic(
  async () => await import('@components/common/modals/download-app').then((comp) => comp.DownloadDialogModal.ui)
)

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
  const visitorAdded = useLocalStorage().visitorAdded
  const setVisitor = useLocalStorage().setVisitor

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
    if (sessionStatus === 'authenticated') {
      setAuthTokenInAxiosInstance(sessionData.user.accessToken)
      setInitialData({ user: sessionData.user })
    } else {
      setInitialData({ user: undefined })
      setAuthTokenInAxiosInstance(undefined)
    }
  }, [sessionStatus, sessionData])

  function init() {
    const isIframe = window !== window.parent
    setInitialData({
      embed: !!config,
      logoUrl: config?.logo,
      brandWebLogo: config?.brand_web_logo,
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
      if (!visitorAdded) {
        // Call API for visitor registration
        setDeviceId(result.visitorId)
        setVisitor(true)
        await saveVisitor(result.visitorId, config?.brand_id, window.navigator.userAgent)
      }
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

  if (!config) {
    return (
      <>
        {children}
        <DownloadDialogModal />
        <AuthenticationModal />
      </>
    )
  }

  if (isLoading) return <SplashScreen />

  if (config) {
    if (sessionStatus === 'loading') return <SplashScreen />

    return (
      <>
        {children}
        <DownloadDialogModal />
        <AuthenticationModal />
      </>
    )
  }
}
async function saveVisitor(visitorId: string, brandId: string | undefined, userAgent: string) {
  const userInfo = parseUserAgent(userAgent)
  return await axiosInstance
    .post('/api/v3/guestusers/visit', {
      device_id: encryptText(visitorId || '', true),
      brand_id: brandId,
      meta_data: {
        ...userInfo,
      },
    })
    .then((res) => {
      if (res.data.code === 200) return true
      else if (res.data.code === '5073') return false
    })
    .catch((e) => {
      console.log('::ERROR in saving visitor api::', e)
      return false
    })
}
