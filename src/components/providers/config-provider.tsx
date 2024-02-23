'use client'
import { SplashScreen } from '@components/common/splash-screen'
import { useEffect, useState } from 'react'
import { GenuinOptionsProvider } from './genuin-options-provider'
import { type ConfigType } from '@lib/stores/genuin-options'
import { getEmbedConfig } from '@lib/api/config'
import { navigate } from './actions'
import { checkAndAppendHttps } from '@lib/utils'

type Props = {
  children: React.ReactNode
  deviceType: string
  os: string
  browserType: string
}

// TODO: FIND A BETTER WAY TO GET CONFIGS.
export function ConfigProvider({ children, ...props }: Props) {
  const [handler, setHandler] = useState<{ isLoading: boolean; config: ConfigType }>({
    isLoading: true,
    config: null,
  })

  useEffect(() => {
    const configParams = getConfig()
    if (configParams) {
      getEmbedConfig(configParams)
        .then((res) => {
          const urlObj = new URL(window.location.href)
          if (res)
            if (res?.integrations.white_label.enable && res.integrations.white_label.allowed_domains.length > 0) {
              void navigate(checkAndAppendHttps(res.integrations.white_label.allowed_domains[0]))
            } else if (
              res &&
              ['/', '/manage', '/market', '/pricing', '/privacy', '/terms', '/verify-email'].includes(urlObj.pathname)
            ) {
              console.log('redirecting::', res)
              // void navigate('/home')
            }
          setHandler((x) => {
            x.config = res
            x.isLoading = false
            return { ...x }
          })
        })
        .catch((e) => {
          console.log('error is here::')
        })
        .finally(() => {
          // setTimeout(() => {
          //   setHandler((x) => {
          //     x.isLoading = false
          //     return { ...x }
          //   })
          // }, 500)
        })
    } else {
      setHandler((x) => {
        x.isLoading = false
        return { ...x }
      })
    }
  }, [])

  if (handler.isLoading) return <SplashScreen />
  return (
    <GenuinOptionsProvider config={handler.config} {...props}>
      {children}
    </GenuinOptionsProvider>
  )
}

function getConfig() {
  const obj = new URL(window.location.href)
  const arr = obj.host.split('.')
  if (['app', 'begenuin', 'localhost:4005'].includes(arr[0])) return ''

  if (!obj.host.includes('begenuin')) return { domain: obj.host }

  return { subdomain: arr[0] }
}
