import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { getKsCbRequestStatus } from '@/utils/auth'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { Suspense, lazy } from 'react'
import {
  AuthProvider,
  BaseContextProvider,
  EmbedProvider,
  LinkProvider,
  ReactQueryClientProvider,
  AnalyticsProvider,
} from '@genuin/components'
import { Loader } from '@genuin/ui/components/loader'
import { Toaster } from '@genuin/ui'
import { BrandDetailsConfigType } from '@genuin/components/types/brand'
import { SingleEmbedDataConfig } from './GenuinSDK'
import { AuthUser } from '@genuin/components/types/auth'

// Error view function
export function loadErrorView(container: HTMLElement): void {
  container.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 20px;
      font-family: Arial, sans-serif;
      color: #666;
      text-align: center;
    ">
      <div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Unable to load content</h3>
        <p style="margin: 0; font-size: 14px;">Please check your configuration and try again.</p>
      </div>
    </div>
  `
}

// Lazy load the Embed component for better code splitting
const LazyEmbed = lazy(() =>
  import('@genuin/components').then((module) => ({
    default: module.Embed,
  })),
)

// Lazy load the StandardWall component for better code splitting
const LazyStandardWall = lazy(() =>
  import('@genuin/components/page/standard-wall/standard-wall').then(
    (module) => ({
      default: module.StandardWall,
    }),
  ),
)

// Generic skeleton for embed
const EmbedSkeleton = () => (
  <div className='gencl:flex gencl:relative gencl:h-full gencl:w-full gencl:bg-secondary-50 gencl:rounded-md'>
    <Loader
      size='md'
      className='gencl:absolute gencl:top-1/2 gencl:left-1/2 gencl:-translate-x-1/2 gencl:-translate-y-1/2'
    />
  </div>
)

// Track React roots per container to support multiple embeds
const containerRootMap = new Map<HTMLElement, Root>()

export function loadNewEmbed({
  container,
  embedData,
  brandDetails,
  config,
  user,
}: {
  container: HTMLElement
  embedData: EmbedDataType
  brandDetails: BrandDetailsConfigType
  config: Partial<SingleEmbedDataConfig>
  user?: AuthUser
}): void {
  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container)
  if (prevRoot) {
    prevRoot.unmount()
    containerRootMap.delete(container)
  }

  const root = createRoot(container)
  containerRootMap.set(container, root)

  const rootToRender = (
    <ReactQueryClientProvider>
      <EmbedProvider
        container={container}
        embedData={{
          ...embedData,
          brand_id: brandDetails.brand_id,
          // TODO: Check for other actions.
          autoUserInteractionToPerform: config.action as any,
        }}>
        <BaseContextProvider
          brandDetails={brandDetails}
          isEmbed>
          <LinkProvider>
            <AuthProvider
              onSignIn={() => {}}
              onSignOut={() => {}}
              onUpdateUser={() => {}}
              user={user}>
              <AnalyticsProvider isWebSDK={true}>
                <Suspense fallback={<EmbedSkeleton />}>
                  {embedData.style === 'standard_wall' ? (
                    <LazyStandardWall />
                  ) : (
                    <LazyEmbed />
                  )}
                </Suspense>
                <Toaster />
              </AnalyticsProvider>
            </AuthProvider>
          </LinkProvider>
        </BaseContextProvider>
      </EmbedProvider>
    </ReactQueryClientProvider>
  )

  root.render(rootToRender)
}
