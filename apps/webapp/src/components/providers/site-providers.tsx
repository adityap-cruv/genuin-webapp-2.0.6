import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'
import { UrlParamProvider } from '@/lib/utils/ssai/urlParamResolver'
import { RedirectHandler } from '@components/providers/redirect-handler'
import { SessionProvider } from 'next-auth/react'
import BrandDetailsProviderClient from '@components/providers/brand-details-provider'
import { ReactQueryClientProvider } from '@genuin/components/react-query/react-query-provider'
import { BaseLayout } from '@genuin/components/templates/base-layout/base-layout'
import { AuthBridge } from './auth-bridge'
import { AnalyticsProvider } from '@genuin/components/context/analytics'
import { LinkBridge } from './link-bridge'
import { Search } from '@genuin/components/molecules/search'

interface SiteProvidersBaseProps {
  children: React.ReactNode
  config: any
  session: any
}

/**
 * Core providers that are common to all site configurations
 */
function CoreProviders({ children, config, session }: SiteProvidersBaseProps) {
  return (
    <ReactQueryClientProvider>
      <BrandDetailsProviderClient brandDetails={config}>
        <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600} session={session}>
          <AuthBridge>
            <LinkBridge>
              <AnalyticsProvider isWebSDK={false}>{children}</AnalyticsProvider>
            </LinkBridge>
          </AuthBridge>
        </SessionProvider>
      </BrandDetailsProviderClient>
    </ReactQueryClientProvider>
  )
}

/**
 * Inner content providers that are common to all site configurations
 */
function InnerContentProviders({ children, config }: { children: React.ReactNode; config: any }) {
  return (
    <RedirectHandler config={config} shouldRedirect={Object.hasOwn(config || {}, 'subdomain')}>
      <ThirdPartyScriptProvider>
        <UrlParamProvider>{children}</UrlParamProvider>
      </ThirdPartyScriptProvider>
    </RedirectHandler>
  )
}

/**
 * SiteProviders component with BaseLayout.
 * Use this when you need the standard layout with navigation, header, and footer.
 */
export function SiteProvidersWithLayout({ children, config, session }: SiteProvidersBaseProps) {
  return (
    <CoreProviders config={config} session={session}>
      <BaseLayout>
        <InnerContentProviders config={config}>{children}</InnerContentProviders>
      </BaseLayout>
    </CoreProviders>
  )
}

/**
 * SiteProviders component without BaseLayout.
 * Use this for custom layouts or when you need full control over the page structure.
 */
export function SiteProvidersWithoutLayout({ children, config, session }: SiteProvidersBaseProps) {
  return (
    <CoreProviders config={config} session={session}>
      <InnerContentProviders config={config}>{children}</InnerContentProviders>
    </CoreProviders>
  )
}

/**
 * Default SiteProviders component.
 * @deprecated Use SiteProvidersWithLayout or SiteProvidersWithoutLayout based on your needs
 */
export default function SiteProviders({ children, config, session }: SiteProvidersBaseProps) {
  return (
    <SiteProvidersWithLayout config={config} session={session}>
      {children}
    </SiteProvidersWithLayout>
  )
}
