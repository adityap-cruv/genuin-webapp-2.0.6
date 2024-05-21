'use client'
import { SplashScreen } from '@components/common/splash-screen'
import { type ConfigType, useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { useSession } from 'next-auth/react'
import { setAuthTokenInAxiosInstance, setBrandIdInAxiosInstance } from '@lib/api/instance'
import dynamic from 'next/dynamic'
import { miniProfile, saveVisitor } from '@lib/api/auth'
import { notificationsCount } from '@lib/api/notification'

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
  const { data: sessionData, status: sessionStatus, update: updateSession } = useSession()
  const { setInitialData, user } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
    user: state.user,
  }))
  const { setDeviceId, visitorAdded, setVisitor } = useLocalStorage((state) => ({
    setDeviceId: state.setDeviceId,
    visitorAdded: state.visitorAdded,
    setVisitor: state.setVisitor,
  }))

  useEffect(() => {
    const intervalTime = 60 * 60 * 1000
    let intervalId: NodeJS.Timeout | null = null

    const loadData = () => {
      void miniProfile(true).then((res) => {
        if (res.code === 200) {
          void updateSession({
            ...sessionData,
            user: { ...sessionData?.user, ...res.data },
          })
          if (res.data.ks_cb_request_status === 3) {
            if (intervalId) clearInterval(intervalId)
          }
        }
      })
    }

    if (user?.accessToken && user.ks_cb_request_status !== 3) {
      setTimeout(() => {
        loadData()
      }, 1000)
      intervalId = setInterval(loadData, intervalTime)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

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

  async function fetchNotificationCount() {
    const { status, count } = await notificationsCount()
    if (status) {
      setInitialData({ notificationCount: count })
    }
  }

  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (sessionStatus === 'authenticated') {
      setAuthTokenInAxiosInstance(sessionData.user.accessToken)
      setInitialData({ user: sessionData.user })
      void fetchNotificationCount()
      if (isLoading) setIsLoading(false)
    }
    if (sessionStatus === 'unauthenticated') {
      setInitialData({ user: undefined })
      setAuthTokenInAxiosInstance(undefined)
      if (isLoading) setIsLoading(false)
    }
  }, [sessionStatus])

  function init() {
    if (config?.brand_id) setBrandIdInAxiosInstance(Number(config?.brand_id))
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
    const fpPromise = FingerprintJS.load()
    void (async () => {
      const fp = await fpPromise
      const result = await fp.get()
      if (!visitorAdded) {
        // Call API for visitor registration
        setDeviceId(result.visitorId)
        setVisitor(true)
        await saveVisitor(result.visitorId, browserType, deviceType, os, config?.brand_id)
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

  if (isLoading) return <SplashScreen />
  return (
    <>
      {children}
      <AuthenticationModal />
      <DownloadDialogModal />
    </>
  )
}
