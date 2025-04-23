import { type ReactNode } from 'react'
import { RootHTML, getViewport } from '@components/layouts/root-layout'
import { SessionProvider } from 'next-auth/react'
import '../globals.css'
import { ReactQueryProvider } from '@components/providers/query-client-provider'
import { cookies } from 'next/headers'
import { type ConfigType } from '@lib/stores/genuin-options'
import { getEmbedConfig } from '@lib/api/config'
import { parseColors } from '@lib/utils'
import { BrandNotFound } from '@components/common/brand-not-found'
import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { EmbedConfigProvider } from '@/components/embed/embed-config-provider'
import { GenuinOptionsProvider } from '@/components/providers/genuin-options-provider'

export default async function Layout({ children }: { children: ReactNode }) {
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
      error = true
    }
  }
  const brandColors = parseColors(config?.brand_colors)

  if (error) return <BrandNotFound />
  return (
    <RootHTML brandColors={brandColors} noIndex>
      <ThirdPartyScriptProvider>
        <SessionProvider>
          <ReactQueryProvider>
            <GenuinOptionsProvider browserType={browserType} deviceType={deviceType} os={os} config={config}>
              <EmbedConfigProvider config={config}>{children}</EmbedConfigProvider>
            </GenuinOptionsProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </ThirdPartyScriptProvider>
    </RootHTML>
  )
}

export const viewport = getViewport()
