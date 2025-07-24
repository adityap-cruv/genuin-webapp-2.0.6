import { type Metadata } from 'next'
import '../../globals.css'
import '@genuin/components/styles'
import { cookies } from 'next/headers'
import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { GenuinOptionsProvider } from '@components/providers/genuin-options-provider'
import { UrlParamProvider } from '@/lib/utils/ssai/urlParamResolver'
import { getEmbedConfig } from '@lib/api/config'
import { type ConfigType } from '@lib/stores/genuin-options'
import { RedirectHandler } from '@components/providers/redirect-handler'
import { BrandNotFound } from '@components/common/brand-not-found'
import { SessionProvider } from 'next-auth/react'
import { parseColors } from '@lib/utils'
import { ReactQueryProvider } from '@components/providers/query-client-provider'
import { RootHTML, getViewport } from '@components/layouts/root-layout'
import { type Session } from 'next-auth'
import { auth } from '../../../../auth'
import { IHeartDemoProvider } from '@/components/providers/iheart-demo-provider'
import { IHEART_BRAND_URL } from '@/lib/constants'
import { SiteProvidersWithoutLayout } from '@/components/providers/site-providers'

export default async function RootLayout(props: any) {
  const cookieStore = await cookies()
  const deviceType = cookieStore.get('device_type')?.value ?? ''
  const os = cookieStore.get('os')?.value ?? ''
  const browserType = cookieStore.get('browser_type')?.value ?? ''
  const configParamsStr = cookieStore.get('config_params')?.value ?? ''
  let configParams = null
  if (configParamsStr) configParams = JSON.parse(configParamsStr)
  let userSession: Session | null = null
  if (configParams) {
    userSession = await auth()
  }

  let config: ConfigType | undefined

  if (configParams) {
    await getEmbedConfig(configParams)
      .then((res) => {
        config = res
      })
      .catch((e) => {
        return (
          <RootHTML>
            <BrandNotFound />
          </RootHTML>
        )
      })
  }

  if (
    !config ||
    (typeof config === 'object' && Object.keys(config).length === 0) ||
    config.brand_id === undefined ||
    config.brand_id === ''
  ) {
    return <RootHTML>{props.children}</RootHTML>
  }
  const brandColors = parseColors(config?.brand_colors)
  const favicon = config?.favicon
  const isIheartDemo = IHEART_BRAND_URL.includes(Number(config?.brand_id) ?? '')

  return (
    <RootHTML brandColors={brandColors} favicon={favicon} subdomain={config?.subdomain} isIheartDemo={isIheartDemo}>
      <RedirectHandler config={config} shouldRedirect={Object.hasOwn(configParams ?? {}, 'subdomain')}>
        <IHeartDemoProvider shouldShowDemo={isIheartDemo} brandId={config?.brand_id ?? ''}>
          <ThirdPartyScriptProvider>
            <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600}>
              <ReactQueryProvider>
                <GenuinOptionsProvider
                  browserType={browserType}
                  deviceType={deviceType}
                  os={os}
                  config={config}
                  user={userSession?.user ?? null}>
                  <UrlParamProvider>
                    <SiteProvidersWithoutLayout config={config} session={userSession}>
                      {props.children}
                    </SiteProvidersWithoutLayout>
                  </UrlParamProvider>
                </GenuinOptionsProvider>
              </ReactQueryProvider>
            </SessionProvider>
          </ThirdPartyScriptProvider>
        </IHeartDemoProvider>
      </RedirectHandler>
    </RootHTML>
  )
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}

export const viewport = getViewport()
