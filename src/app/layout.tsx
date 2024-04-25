import { type Metadata } from 'next'
import './globals.css'
import { ReactQueryProvider } from '@components/providers/query-client-provider'
import { cookies } from 'next/headers'
import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { GenuinOptionsProvider } from '@components/providers/genuin-options-provider'
import { getEmbedConfig } from '@lib/api/config'
import { type ConfigType } from '@lib/stores/genuin-options'
import { RedirectHandler } from '@components/providers/redirect-handler'
import { BrandNotFound } from '@components/common/brand-not-found'
import { SessionProvider } from 'next-auth/react'
import { parseColors } from '@lib/utils'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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
  const favicon = config?.favicon

  return (
    <html lang="en" style={{ ...brandColors }}>
      <head>
        <link rel="icon" type="image/x-icon" href={favicon || '/favicon.svg'} />
        <link rel="mask-icon" href={favicon || '/favicon.svg'} />
        <meta rel="x-brand-id" content={config?.subdomain} />
        {/* <script src="https://www.google.com/recaptcha/enterprise.js?render=6LeQm4gpAAAAAC2o51SQj-ak7ojnfOlxyDiR9E7p"></script> */}
      </head>
      <body className="index-page-background !absolute inset-0 min-h-full min-w-full text-secondary">
        {error ? (
          <BrandNotFound />
        ) : (
          <RedirectHandler config={config} shouldRedirect={Object.hasOwn(configParams ?? {}, 'subdomain')}>
            <ThirdPartyScriptProvider isEmbed={!!config}>
              <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600}>
                <GenuinOptionsProvider browserType={browserType} deviceType={deviceType} os={os} config={config}>
                  <ReactQueryProvider>{children}</ReactQueryProvider>
                </GenuinOptionsProvider>
              </SessionProvider>
            </ThirdPartyScriptProvider>
          </RedirectHandler>
        )}
      </body>
    </html>
  )
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}
