'use client'
import { SplashScreen } from '@components/common/splash-screen'
import { getEmbedConfig } from '@lib/api/config'
import { type ConfigType, useGenuinOptions } from '@lib/stores/genuin-options'
import { getSizeBoxes } from '@lib/utils/common/size-box'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()

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

  function setData(config: ConfigType) {
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

  function getConfig() {
    const obj = new URL(window.location.href)
    const arr = obj.host.split('.')
    if (['app', 'begenuin', 'localhost:4005'].includes(arr[0])) return null

    if (!obj.host.includes('begenuin')) return { domain: obj.host }

    return { subdomain: arr[0] }
  }

  function init() {
    const config = getConfig()
    const urlObj = new URL(window.location.href)

    if (
      config &&
      ['/', '/manage', '/market', '/pricing', '/privacy', '/terms', '/verify-email'].includes(urlObj.pathname)
    ) {
      urlObj.pathname = '/home'
      router.replace('/home')
    }

    if (config) {
      getEmbedConfig(config)
        .then((res) => {
          setData(res)
        })
        .catch((e) => {
          // console.log('error::', e)
        })
    } else {
      setData(null)
    }
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
