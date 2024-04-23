'use client'
import { SplashScreen } from '@components/common/splash-screen'
import { type ConfigType, useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import FingerpringJS from '@fingerprintjs/fingerprintjs'
import { useSession } from 'next-auth/react'
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

// it won't log any consoles in production.
// eslint-disable-next-line no-console
if (process.env.NEXT_PUBLIC_CURRENT_ENV === 'prod') console.log = () => {}

// TODO: separate this component into 2 comps with once has auth and second doesn't have auth.
export function GenuinOptionsProvider({ children, deviceType, os, browserType, config }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const { data: sessionData, status: sessionStatus } = useSession()
  const { setInitialData } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
  }))
  const { setDeviceId, visitorAdded, setVisitor } = useLocalStorage((state) => ({
    setDeviceId: state.setDeviceId,
    visitorAdded: state.visitorAdded,
    setVisitor: state.setVisitor,
  }))

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
    if (sessionStatus === 'loading') return
    if (sessionStatus === 'authenticated') {
      setAuthTokenInAxiosInstance(sessionData.user.accessToken)
      setInitialData({ user: sessionData.user })
      if (isLoading) setIsLoading(false)
    }
    if (sessionStatus === 'unauthenticated') {
      setInitialData({ user: undefined })
      setAuthTokenInAxiosInstance(undefined)
      if (isLoading) setIsLoading(false)
    }
  }, [sessionStatus])

  function init() {
    const isIframe = window !== window.parent
    setInitialData({
      embed: !!config,
      logoUrl: config?.logo,
      brandWebLogo: config?.brand_web_logo,
      brandId: config?.brand_id,
      showNavbar: !hideNavbar,
      isMobile,
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

  console.log('What happening::', isLoading, sessionStatus, sessionData)
  // if (!config) {
  //   return (
  //     <>
  //       {children}
  //       <DownloadDialogModal />
  //       <AuthenticationModal />
  //     </>
  //   )
  // }

  // if (isLoading) return <SplashScreen />

  // if (config) {
  //   if (sessionStatus === 'loading') return <SplashScreen />

  //   return (
  //     <>
  //       {children}
  //       <DownloadDialogModal />
  //       <AuthenticationModal />
  //     </>
  //   )
  // }

  if (isLoading) return <SplashScreen />
  return (
    <>
      {children}
      {!!config && <AuthenticationModal />}
      {!config && <DownloadDialogModal />}
    </>
  )
}

// TODO: move it to right location.
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
      return false
    })
}
