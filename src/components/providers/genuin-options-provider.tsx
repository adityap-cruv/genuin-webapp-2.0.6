'use client'
import { type ConfigType, useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { setBrandIdInAxiosInstance, ejectAuthTokenInterceptor, setAuthTokenInAxiosInstance } from '@lib/api/instance'
import dynamic from 'next/dynamic'
import { saveVisitor } from '@components/common/modals/authentication/api/auth'
import { notificationsCount } from '@lib/api/notification'
import { useRefreshToken } from '@/hooks/use-refresh-token'
import { rudderStackIdentify } from '@/services/analytics/useRudderAnalytics'
import { getBalanceAPI } from '@/lib/api/wallet'
import { type User } from 'next-auth'
import { useSession } from 'next-auth/react'
import Analytics from '@/services/analytics'

const RepostModal = dynamic(
  async () => await import('@components/common/modals/repost').then((comp) => comp.RepostModal.ui)
)

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
  user: User | null
}
// it won't log any consoles in production.
// eslint-disable-next-line no-console
if (process.env.NEXT_PUBLIC_CURRENT_ENV === 'prod') console.log = () => {}

// TODO: separate this component into 2 comps with once has auth and second doesn't have auth.
export function GenuinOptionsProvider({ children, deviceType, os, browserType, config, user }: Props) {
  const { data, status } = useSession()
  const { setInitialData } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
  }))
  const { setDeviceId, visitorAdded, setVisitor } = useLocalStorage((state) => ({
    setDeviceId: state.setDeviceId,
    visitorAdded: state.visitorAdded,
    setVisitor: state.setVisitor,
  }))
  useRefreshToken()

  const searchParams = useSearchParams()

  const hideNavbar = searchParams.get('hide_navbar') === '1'
  const from = searchParams.get('from') ?? ''
  const isMobile = deviceType === 'mobile'
  const isSafari = browserType.toLowerCase().includes('safari')

  async function fetchNotificationCount() {
    const { status, count } = await notificationsCount()
    if (status) {
      setInitialData({ notificationCount: count })
    }
  }

  async function fetchWalletBalance() {
    const { wallet } = await getBalanceAPI({ isCurrentBalance: true })
    setInitialData({ walletBalance: Number(wallet.balance) })
  }

  useEffect(() => {
    let interceptorId: number
    if (user) {
      interceptorId = setAuthTokenInAxiosInstance(user.accessToken)
      setInitialData({ user, isLoading: false })
      void fetchNotificationCount()
      void fetchWalletBalance()
    }
    void rudderStackIdentify()
    // Init added
    Analytics.track({ eventName: 'Initialized', properties: {} })

    return () => {
      ejectAuthTokenInterceptor(interceptorId)
    }
  }, [])

  useEffect(() => {
    if (!!user || status === 'loading') return
    if (status === 'unauthenticated') {
      setInitialData({ user: undefined, isLoading: false })
      setAuthTokenInAxiosInstance(undefined)
    } else {
      setInitialData({ user: data?.user, isLoading: false })
      setAuthTokenInAxiosInstance(data?.user?.accessToken)
      if (data?.user) {
        void fetchNotificationCount()
        void fetchWalletBalance()
      }
    }
  }, [user, status])

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
      sizeBoxes: getSizeBoxes(isMobile, !hideNavbar),
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

  return (
    <>
      {children}
      <AuthenticationModal showClose />
      <DownloadDialogModal />
      {!!user && <RepostModal />}
    </>
  )
}
