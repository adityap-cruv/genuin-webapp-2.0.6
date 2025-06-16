import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { UrlParamProvider } from '@/lib/utils/ssai/urlParamResolver'
import { RedirectHandler } from '@components/providers/redirect-handler'
import { SessionProvider } from 'next-auth/react'
import BrandDetailsProviderClient from '@components/providers/brand-details-provider'
import { ReactQueryClientProvider } from '@genuin/components/react-query/react-query-provider'
import { BaseLayout } from '@genuin/components/templates/base-layout/base-layout'
import { OldSearch } from './old-search'
import { AuthBridge } from './auth-bridge'

interface SiteProvidersProps {
  children: React.ReactNode
  config: any
  session: any
}

export default function SiteProviders({ children, config, session }: SiteProvidersProps) {
  return (
    <ReactQueryClientProvider>
      <BrandDetailsProviderClient brandDetails={config}>
        <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600} session={session}>
          <AuthBridge>
            <BaseLayout search={<OldSearch />}>
              <RedirectHandler config={config} shouldRedirect={Object.hasOwn(config || {}, 'subdomain')}>
                <ThirdPartyScriptProvider>
                  <UrlParamProvider>{children}</UrlParamProvider>
                </ThirdPartyScriptProvider>
              </RedirectHandler>
            </BaseLayout>
          </AuthBridge>
        </SessionProvider>
      </BrandDetailsProviderClient>
    </ReactQueryClientProvider>
  )
}
