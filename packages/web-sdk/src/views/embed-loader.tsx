import { AuthUser, EmbedDataType } from '@/type'
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

export function loadNewEmbed(
  container: HTMLElement,
  embedData: EmbedDataType,
  user?: AuthUser,
): void {
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
          brand_id: embedData.brandDetails.brand_id,
          autoUserInteractionToPerform: embedData.action as any,
        }}>
        <BaseContextProvider
          brandDetails={embedData.brandDetails}
          isEmbed>
          <LinkProvider>
            <AuthProvider
              onSignIn={() => {}}
              onSignOut={() => {}}
              onUpdateUser={() => {}}
              user={
                user
                  ? {
                      ...user,
                      ksCbRequestStatus: getKsCbRequestStatus(
                        user.ksCbRequestStatus,
                      ),
                    }
                  : undefined
              }>
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
