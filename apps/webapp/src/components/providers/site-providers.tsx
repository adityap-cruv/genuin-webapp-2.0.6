import { AxiosProvider } from "@genuin/components/context";
import { AnalyticsProvider } from "@genuin/components/context/analytics";
import { ReactQueryClientProvider } from "@genuin/components/react-query/react-query-provider";
import { BaseLayout } from "@genuin/components/templates/base-layout/base-layout";
import { SessionProvider } from "next-auth/react";

import { UrlParamProvider } from "@/lib/utils/ssai/urlParamResolver";
import BrandDetailsProviderClient from "@components/providers/brand-details-provider";
import { RedirectHandler } from "@components/providers/redirect-handler";

import { AuthBridge } from "./auth-bridge";
import { AutoLoginHandler } from "./auto-login-handler";
import { LinkBridge } from "./link-bridge";

interface SiteProvidersBaseProps {
  children: React.ReactNode;
  config: any;
  session: any;
}

/**
 * Core providers that are common to all site configurations
 */
function CoreProviders({ children, config, session }: SiteProvidersBaseProps) {
  return (
    <ReactQueryClientProvider>
      <AxiosProvider brandId={config.brand_id}>
        <BrandDetailsProviderClient brandDetails={config}>
          <SessionProvider refetchOnWindowFocus={false} refetchInterval={3600} session={session}>
            <AuthBridge>
              <AutoLoginHandler />
              <LinkBridge>
                <AnalyticsProvider user={null} isWebSDK={false} brandDetails={config}>
                  {children}
                </AnalyticsProvider>
              </LinkBridge>
            </AuthBridge>
          </SessionProvider>
        </BrandDetailsProviderClient>
      </AxiosProvider>
    </ReactQueryClientProvider>
  );
}

/**
 * Inner content providers that are common to all site configurations
 */
function InnerContentProviders({ children, config }: { children: React.ReactNode; config: any }) {
  return (
    <RedirectHandler config={config} shouldRedirect={Object.hasOwn(config || {}, "subdomain")}>
      <UrlParamProvider>{children}</UrlParamProvider>
    </RedirectHandler>
  );
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
  );
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
  );
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
  );
}
