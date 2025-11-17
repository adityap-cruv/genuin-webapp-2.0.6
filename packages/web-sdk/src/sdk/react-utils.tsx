import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { createRoot } from 'react-dom/client'
import ReactDOMServer from 'react-dom/server'
import type { Root } from 'react-dom/client'
import { Suspense, lazy } from 'react'
// Import providers directly from their specific paths to avoid loading entire components package
import { AuthProvider } from '@genuin/components/context/auth'
import { BaseContextProvider } from '@genuin/components/context/base'
import { EmbedProvider } from '@genuin/components/context/embed'
import { LinkProvider } from '@genuin/components/context/link'
import { ReactQueryClientProvider } from '@genuin/components/react-query/react-query-provider'
import { AnalyticsProvider } from '@genuin/components/context/analytics'
import { Loader } from '@genuin/ui/components/loader'
import { Toaster } from '@genuin/ui'
import { BrandDetailsConfigType } from '@genuin/components/types/brand'
import { AuthUser } from '@genuin/components/types/auth'
import { SingleEmbedDataConfig } from '@/type'
import { FeedSkeleton } from '@genuin/components/templates/feed'
import { SDKEventType } from '@/core'
import { getBrandType } from '@genuin/components/lib/utils/brand-layout'

// Track React roots per container to support multiple embeds
const containerRootMap = new Map<HTMLElement, Root>()

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

// Loading view function
export function loadLoadingView(
  container: HTMLElement,
  theme?: 'dark' | 'light',
): void {
  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container)
  if (prevRoot) {
    prevRoot.unmount()
    containerRootMap.delete(container)
  }

  const root = createRoot(container)
  containerRootMap.set(container, root)

  root.render(<EmbedSkeleton theme={theme} />)
}

// Expand view function
export function loadExpandView(
  container: HTMLElement,
  theme?: 'dark' | 'light',
): void {
  // Check if loader div already exists, if not, create it
  let loaderDiv = document.getElementById(
    'gen-sdk-expand-view-loader',
  ) as HTMLElement | null

  if (!loaderDiv) {
    loaderDiv = document.createElement('div')
    loaderDiv.id = 'gen-sdk-expand-view-loader'
    loaderDiv.classList.add('loader') // optional class
    document.body.appendChild(loaderDiv)
  }

  // Create a React root inside the loader div
  const root = createRoot(loaderDiv)

  /*
  Remove or unmount the loader div when the "sdk:expand-view-loaded" event is emitted,
  indicating that the expand view has successfully loaded.
  */
  const cleanup = () => {
    if (loaderDiv) {
      root.unmount()
      loaderDiv.remove()
      loaderDiv = null
    }
  }

  const unsubscribe = window.genuin?.onInternal?.(
    SDKEventType.SDK_EXPAND_VIEW_CHANGED,
    (payload: any) => {
      // If payload is opened true, we need to clean up the loader
      if (payload.payload) {
        cleanup()
        // Clean up the event listener
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    },
  )

  root.render(<ExpandViewSkeleton theme={theme} />)
}

// Lazy load the Embed component for better code splitting
const LazyEmbed = lazy(() =>
  import('@genuin/components/organisms/embed/embed')
    .then((module) => ({
      default: module.Embed,
    }))
    .catch((error) => {
      console.error('Failed to load Embed component:', error)
      // Fallback to a basic error component
      return { default: () => <div>Failed to load embed component</div> }
    }),
)

// Lazy load the StandardWall component for better code splitting
const LazyStandardWall = lazy(() =>
  import('@genuin/components/page/standard-wall/standard-wall')
    .then((module) => ({
      default: module.StandardWall,
    }))
    .catch((error) => {
      console.error('Failed to load StandardWall component:', error)
      // Fallback to a basic error component
      return {
        default: () => <div>Failed to load standard wall component</div>,
      }
    }),
)

// Generic skeleton for embed
const EmbedSkeleton = ({ theme }: { theme?: 'dark' | 'light' }) => {
  const bgClass =
    theme === 'dark' ? 'gencl:bg-secondary-900' : 'gencl:bg-secondary-50'
  return (
    <div
      className={`gencl:flex gencl:relative gencl:h-full gencl:w-full ${bgClass} gencl:rounded-md`}>
      <Loader
        size='md'
        className='gencl:absolute gencl:top-1/2 gencl:left-1/2 gencl:-translate-x-1/2 gencl:-translate-y-1/2'
      />
    </div>
  )
}

const ExpandViewSkeleton = ({ theme }: { theme?: 'dark' | 'light' }) => {
  const bgClass =
    theme === 'dark' ? 'gencl:bg-secondary-900' : 'gencl:bg-secondary-50'
  return (
    <div
      className={`gencl:fixed gencl:inset-0 gencl:h-full gencl:w-full gencl:z-50 ${bgClass}`}>
      <FeedSkeleton
        theme={theme}
        variant='fullscreen'
      />
    </div>
  )
}

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
  user?: AuthUser | null
}): () => void {
  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container)
  prevRoot?.unmount()
  containerRootMap.delete(container)

  const root = createRoot(container)
  containerRootMap.set(container, root)

  // Determine brand layout type
  const isPlacementView = !!embedData.placement_id
  const cardLayoutId = isPlacementView
    ? embedData.placement_card_layout_id
    : embedData.card_layout_id
  const videoLayoutId = isPlacementView
    ? embedData.placement_video_layout_id
    : embedData.video_layout_id
  const brandLayoutType = getBrandType(cardLayoutId, videoLayoutId)

  const rootToRender = (
    <ReactQueryClientProvider>
      <EmbedProvider
        container={container}
        embedData={{
          ...embedData,
          brand_id: embedData.brand_id,
          action: embedData.autoUserInteractionToPerform,
          websiteType: config.websiteType,
        }}
        brandLayoutType={brandLayoutType}>
        <BaseContextProvider
          brandDetails={brandDetails}
          theme={config.theme}
          isEmbed>
          <LinkProvider>
            <AuthProvider
              onSignIn={() => {}}
              onSignOut={() => {}}
              onUpdateUser={() => {}}
              user={user}>
              <AnalyticsProvider
                embedData={embedData}
                isWebSDK={true}>
                <Suspense fallback={<EmbedSkeleton theme={config.theme} />}>
                  {embedData.style === 'standard_wall' ? (
                    <LazyStandardWall />
                  ) : (
                    <LazyEmbed />
                  )}
                </Suspense>
                {brandLayoutType !== 'iheart' && <Toaster />}
              </AnalyticsProvider>
            </AuthProvider>
          </LinkProvider>
        </BaseContextProvider>
      </EmbedProvider>
    </ReactQueryClientProvider>
  )

  root.render(rootToRender)

  // Return cleanup function
  return () => {
    root.unmount()
    containerRootMap.delete(container)
    container.remove()
  }
}
