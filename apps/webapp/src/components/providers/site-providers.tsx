import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { UrlParamProvider } from '@/lib/utils/ssai/urlParamResolver'
import { RedirectHandler } from '@components/providers/redirect-handler'
import { SessionProvider } from 'next-auth/react'
import BrandDetailsProviderClient from '@components/providers/brand-details-provider'

interface SiteProvidersProps {
  children: React.ReactNode
  config: any
  session: any
}

export default function SiteProviders({ children, config, session }: SiteProvidersProps) {
  return (
    <BrandDetailsProviderClient brandDetails={config}>
      <RedirectHandler config={config} shouldRedirect={Object.hasOwn(config || {}, 'subdomain')}>
        <ThirdPartyScriptProvider>
          <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600} session={session}>
            <UrlParamProvider>{children}</UrlParamProvider>
          </SessionProvider>
        </ThirdPartyScriptProvider>
      </RedirectHandler>
    </BrandDetailsProviderClient>
  )
}
