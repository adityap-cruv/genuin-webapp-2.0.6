import { type Metadata } from 'next'
import '../globals.css'
import { cookies } from 'next/headers'
import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { GenuinOptionsProvider } from '@components/providers/genuin-options-provider'
import { getEmbedConfig } from '@lib/api/config'
import { type ConfigType } from '@lib/stores/genuin-options'
import { RedirectHandler } from '@components/providers/redirect-handler'
import { BrandNotFound } from '@components/common/brand-not-found'
import { SessionProvider } from 'next-auth/react'
import { parseColors } from '@lib/utils'
import { ReactQueryProvider } from '@components/providers/query-client-provider'
import { RootHTML } from '@components/layouts/root-layout'

export default async function RootLayout(props: any) {
  const deviceType = cookies().get('device_type')?.value ?? ''
  const os = cookies().get('os')?.value ?? ''
  const browserType = cookies().get('browser_type')?.value ?? ''
  const configParamsStr = cookies().get('config_params')?.value ?? ''
  let configParams = null
  if (configParamsStr) configParams = JSON.parse(configParamsStr)

  let config: ConfigType | undefined
  let error = false

  if (configParams) {
    try {
      config = await getEmbedConfig(configParams)
    } catch (e) {
      console.log('error::', e)
      error = true
    }
  }
  const brandColors = parseColors(config?.brand_colors)
  const favicon = config?.favicon

  if (error)
    return (
      <RootHTML>
        <BrandNotFound />
      </RootHTML>
    )

  return (
    <RootHTML brandColors={brandColors} favicon={favicon} subdomain={config?.subdomain}>
      <RedirectHandler config={config} shouldRedirect={Object.hasOwn(configParams ?? {}, 'subdomain')}>
        <ThirdPartyScriptProvider isEmbed={!!config}>
          <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600}>
            <ReactQueryProvider>
              <GenuinOptionsProvider browserType={browserType} deviceType={deviceType} os={os} config={config}>
                {props.children}
              </GenuinOptionsProvider>
            </ReactQueryProvider>
          </SessionProvider>
        </ThirdPartyScriptProvider>
      </RedirectHandler>
    </RootHTML>
  )
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}
