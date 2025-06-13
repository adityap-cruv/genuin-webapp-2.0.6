import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { UrlParamProvider } from '@/lib/utils/ssai/urlParamResolver'
import { RedirectHandler } from '@components/providers/redirect-handler'
import { SessionProvider } from 'next-auth/react'
import BrandDetailsProviderClient from '@components/providers/brand-details-provider'
import { ReactQueryClientProvider } from '@genuin/components/react-query/react-query-provider'
import { BaseLayout } from '@genuin/components/templates/base-layout/base-layout'
import { parseBrandColors } from '@genuin/components/lib/utils/brand-color-parser'

interface SiteProvidersProps {
  children: React.ReactNode
  config: any
  session: any
}

export default function SiteProviders({ children, config, session }: SiteProvidersProps) {
  const parsedColors = parseBrandColors(config?.brand_colors)
  return (
    <main style={{ ...parsedColors }}>
      <ReactQueryClientProvider>
        <BaseLayout>
          <BrandDetailsProviderClient brandDetails={config}>
            <RedirectHandler config={config} shouldRedirect={Object.hasOwn(config || {}, 'subdomain')}>
              <ThirdPartyScriptProvider>
                <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600} session={session}>
                  <UrlParamProvider>{children}</UrlParamProvider>
                </SessionProvider>
              </ThirdPartyScriptProvider>
            </RedirectHandler>
          </BrandDetailsProviderClient>
        </BaseLayout>
      </ReactQueryClientProvider>
    </main>
  )
}
