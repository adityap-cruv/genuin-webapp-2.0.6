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

// TODO: Remove this staic value once colors starts coming from brand.
const colors = {
  secondary: {
    secondary_300: '#707070',
    secondary_400: '#414141',
    secondary: '#111111',
    secondary_600: '#0e0e0e',
  },
  tertiary: {
    tertiary_100: '#fafafa',
    tertiary_200: '#f4f4f4',
    tertiary_300: '#d4d4d4',
    tertiary_400: '#b4b4b4',
    tertiary: '#949494',
  },
  primary: {
    primary_100: '#fbe9e8',
    primary_200: '#F7D2D1',
    primary_300: '#EC8F8C',
    primary_400: '#E4625D',
    primary: '#D91E18',
    primary_600: '#981511',
    primary_700: '#6D0F0C',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const deviceType = cookies().get('device_type')?.value ?? ''
  const os = cookies().get('os')?.value ?? ''
  const browserType = cookies().get('browser_type')?.value ?? ''
  const configParamsStr = cookies().get('config_params')?.value ?? ''
  let configParams = null
  if (configParamsStr) configParams = JSON.parse(configParamsStr)
  const brandColors = parseColors(colors)

  let config: ConfigType | undefined
  let error = false

  if (configParams) {
    try {
      config = await getEmbedConfig(configParams)
    } catch (e) {
      error = true
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" />
        <meta rel="x-brand-id" content={config?.subdomain} />
        {/* <script src="https://www.google.com/recaptcha/enterprise.js?render=6LeQm4gpAAAAAC2o51SQj-ak7ojnfOlxyDiR9E7p"></script> */}
      </head>
      <body className="index-page-background !absolute inset-0 min-h-full min-w-full text-new-off-black">
        {error ? (
          <BrandNotFound />
        ) : (
          <RedirectHandler config={config} shouldRedirect={Object.hasOwn(configParams ?? {}, 'subdomain')}>
            <ThirdPartyScriptProvider isEmbed={!!config}>
              <SessionProvider>
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
