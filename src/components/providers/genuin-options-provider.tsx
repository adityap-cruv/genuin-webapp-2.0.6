'use client'
import { type ConfigType, useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { setBrandIdInAxiosInstance, ejectAuthTokenInterceptor, setAuthTokenInAxiosInstance } from '@lib/api/instance'
import dynamic from 'next/dynamic'
import { saveVisitor, ssoAutoLogin } from '@components/common/modals/authentication/api/auth'
import { notificationsCount } from '@lib/api/notification'
import { useRefreshToken } from '@/hooks/use-refresh-token'
import { rudderStackIdentify } from '@/services/analytics/useRudderAnalytics'
import { getBalanceAPI } from '@/lib/api/wallet'
import { type User } from 'next-auth'
import { useSession, signIn } from 'next-auth/react'
import { RepostModal } from '@components/common/modals/repost'
import { replaceUrlWithoutReload } from '@/lib/utils'
import { useIHeartDemoStates } from './iheart-demo-provider'

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
  user?: User | null
}
// it won't log any consoles in production.
// eslint-disable-next-line no-console
if (process.env.NEXT_PUBLIC_CURRENT_ENV === 'prod') console.log = () => {}

// TODO: separate this component into 2 comps with once has auth and second doesn't have auth.
// TODO: This component is too big, consider splitting it into smaller components.
export function GenuinOptionsProvider({ children, deviceType, os, browserType, config, user }: Props) {
  const router = useRouter()
  const { data: sessionData, status } = useSession()
  const { shouldShowIHeartDemo } = useIHeartDemoStates()
  const { setInitialData } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
  }))
  const { setDeviceId, visitorAdded, setVisitor } = useLocalStorage((state) => ({
    setDeviceId: state.setDeviceId,
    visitorAdded: state.visitorAdded,
    setVisitor: state.setVisitor,
  }))
  useRefreshToken()

  useEffect(() => {
    if (config?.status === 3) {
      router.push('/inactive')
    }
  }, [config?.status, router])

  const searchParams = useSearchParams()

  const hideNavbar = searchParams.get('hide_navbar') === '1'
  const from = searchParams.get('from') ?? ''
  const isMobile = deviceType === 'mobile'
  const isSafari = browserType.toLowerCase().includes('safari')
  const host = typeof window !== 'undefined' ? window.location.host : process.env.NEXT_PUBLIC_HOST

  async function fetchNotificationCount() {
    const response = await notificationsCount()
    if (!response) return
    if (response.status) setInitialData({ notificationCount: response.count })
  }

  async function fetchWalletBalance() {
    const { wallet } = await getBalanceAPI({ isCurrentBalance: true })
    setInitialData({ walletBalance: Number(wallet.balance) })
  }

  useEffect(() => {
    const autoLoginToken = searchParams.get('auto_login_token')
    const action = searchParams.get('action')
    const videoId = searchParams.get('video_id')
    if (!autoLoginToken || !config) return
    void ssoAutoLogin(autoLoginToken, config.brand_id)
      .then(async (user) => {
        if (user) {
          setAuthTokenInAxiosInstance(user.accessToken)
          await signIn('credentials', { ...user, redirect: false }).then((value) => {
            if (value?.ok) {
              if (action && action === 'repost' && videoId) {
                const url = new URL(window.location.href)
                url.searchParams.delete('auto_login_token')
                url.searchParams.delete('action')
                url.searchParams.delete('video_id')
                replaceUrlWithoutReload(url)
                RepostModal.open(videoId)
              }
            }
          })
        }
      })
      .catch((e) => {
        console.log('error', e)
      })
  }, [searchParams])

  useEffect(() => {
    let interceptorId: number
    if (user) {
      interceptorId = setAuthTokenInAxiosInstance(user.accessToken)
      setInitialData({ user, isLoading: false })
      void fetchNotificationCount()
      void fetchWalletBalance()
    }
    void rudderStackIdentify()

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
      setInitialData({ user: sessionData?.user, isLoading: false })
      setAuthTokenInAxiosInstance(sessionData?.user?.accessToken)
      if (sessionData?.user) {
        void fetchNotificationCount()
        void fetchWalletBalance()
      }
    }
  }, [user, status])

  // update user data when session data is updated.
  useEffect(() => {
    if (sessionData?.user) {
      setInitialData({ user: sessionData?.user })
    }
  }, [sessionData])

  function getParsedWebConfigs() {
    let parsedWebConfigs = null
    try {
      const webConfigs = searchParams.get('web_configs') ?? '{}'
      parsedWebConfigs = JSON.parse(decodeURIComponent(webConfigs))
    } catch (error) {
      console.error('Failed to parse web_configs:', error)
    }
    return parsedWebConfigs
  }

  function init() {
    if (config?.brand_id) setBrandIdInAxiosInstance(Number(config?.brand_id))

    const parsedWebConfigs = getParsedWebConfigs()
    if (config?.web_configs && parsedWebConfigs) {
      Object.assign(config.web_configs, parsedWebConfigs)
    }

    const isIframe = window !== window.parent
    setInitialData({
      logoUrl: config?.logo,
      brandWebLogo: config?.brand_web_logo,
      brandId: config?.brand_id,
      showNavbar: !hideNavbar,
      isMobile,
      sizeBoxes: getSizeBoxes(isMobile, !hideNavbar, shouldShowIHeartDemo),
      isIframe,
      deviceType,
      os,
      browserType,
      isSafari,
      parentUrl: from,
      config,
      webCTA: config?.web_cta ?? 'app',
      // webCTA: 'app',
      host,
    })
  }

  function handleResize() {
    setInitialData({ sizeBoxes: getSizeBoxes(isMobile, !hideNavbar, shouldShowIHeartDemo) })
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
      <RepostModal.ui />
    </>
  )
}
