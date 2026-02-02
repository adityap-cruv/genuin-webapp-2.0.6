import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { Suspense, lazy, type ComponentType, type ReactNode } from 'react'
import { BrandDetailsConfigType } from '@genuin/components/types/brand'
import { AuthUser } from '@genuin/components/types/auth'
import { SingleEmbedDataConfig } from '@/type'
import { SDKEventType } from '@/core'
import { metrics } from '../utils/metrics'
import {
  // generateEmbedSkeletonHTML,
  generateExpandViewSkeletonHTML,
} from '../utils/skeleton-html'
import { SdkSkeleton } from '@genuin/components'
import {
  cleanupOverlayShadowHost,
  setupMainShadowDOM,
} from '@genuin/components/molecules/root-portal/shadow-root/shadow-dom.utils'
import { Genuin } from './genuin-sdk'
import { TRACK_OBSERVABILITY } from '@genuin/components/lib/utils/env'

// Import providers directly instead of lazy loading
import { AuthProvider } from '@genuin/components/context/auth'
import { BaseContextProvider } from '@genuin/components/context/base'
import { EmbedProvider } from '@genuin/components/context/embed'
import { LinkProvider } from '@genuin/components/context/link'
import { ReactQueryClientProvider } from '@genuin/components/react-query/react-query-provider'
import { AnalyticsProvider } from '@genuin/components/context/analytics'
// Lazy load Toaster for better code splitting
const LazyToaster = lazy(() =>
  import('@genuin/ui/components/toaster').then((module) => ({
    default: module.Toaster,
  })),
)
import { Skeleton } from '@genuin/ui/components/skeleton'
import { getBrandType } from '@genuin/components/lib/utils/brand-layout'
import { cn } from '@genuin/ui/lib/utils'
import { useDeviceDetectMediaQuery } from '@genuin/components/hooks/use-devide-detect-media-query'

// Track React roots per container to support multiple embeds
const containerRootMap = new Map<HTMLElement, Root>()

// Global toaster singleton
let toasterRoot: Root | null = null

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

  root.render(
    <EmbedSkeleton
      container={container}
      theme={theme}
    />,
  )
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
    loaderDiv.classList.add('gen-sdk-class') // optional class
    loaderDiv.classList.add('gen-sdk-root-portal') // optional class
    loaderDiv.style.position = 'fixed'
    loaderDiv.style.zIndex = '30'
    loaderDiv.style.top = '0'
    loaderDiv.style.left = '0'
    loaderDiv.style.width = '100%'
    loaderDiv.style.height = '100%'
    document.body.appendChild(loaderDiv)
  }

  // Create a React root inside the loader div
  const root =
    containerRootMap.get(loaderDiv) ??
    (() => {
      const newRoot = createRoot(loaderDiv)
      containerRootMap.set(loaderDiv, newRoot)
      return newRoot
    })()

  /*
  Remove or unmount the loader div when the "sdk:expand-view-loaded" event is emitted,
  indicating that the expand view has successfully loaded.
  */
  const cleanup = () => {
    if (loaderDiv) {
      // Add a small delay before cleanup to ensure smooth transition
      setTimeout(() => {
        root.unmount()
        containerRootMap.delete(loaderDiv!)
        loaderDiv?.remove()
        loaderDiv = null
      }, 200)
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

  // Use HTML/CSS skeleton instead of React for faster initial load
  loaderDiv.innerHTML = generateExpandViewSkeletonHTML({ theme })
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

/**
 * React-based skeleton component (loaded after providers are available)
 * Used as Suspense fallback after providers are loaded
 */
function EmbedSkeleton({
  container,
  theme,
}: {
  container: HTMLElement
  theme?: 'dark' | 'light'
}) {
  const bgClass =
    theme === 'dark' ? 'gencl:bg-secondary-900' : 'gencl:bg-secondary-200'
  const shimmerBgClass =
    theme === 'dark' ? 'gencl:bg-secondary-800' : 'gencl:bg-secondary-100'
  const { isDesktop } = useDeviceDetectMediaQuery()
  const websiteType = container.getAttribute('data-website-type')

  return (
    <div
      className={`gencl:relative gencl:h-full gencl:w-full gencl:rounded-md ${isDesktop && bgClass}`}>
      {websiteType ? (
        <div
          style={{
            height: !isDesktop ? '100%' : 'calc(100% - 68px)',
          }}
          className={cn(
            'gencl:w-full gencl:flex gencl:overflow-auto gencl:gap-2',
            !isDesktop && websiteType === 'polaris' && 'gencl:flex-col',
          )}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className={cn(
                'gencl:aspect-square gencl:flex-shrink-0 gencl:rounded-md',
                !isDesktop && websiteType === 'polaris'
                  ? 'gencl:w-full'
                  : 'gencl:h-full',
                shimmerBgClass,
              )}
            />
          ))}
        </div>
      ) : (
        <SdkSkeleton
          containerHeight={container.clientHeight || 400}
          containerWidth={container.clientWidth || 600}
          statsHeight={68}
          linkoutHeight={40}
          spaceBetweenVideos={8}
          availableHeight={container.clientHeight || 400}
        />
      )}
    </div>
  )
}

// Lazy load FeedSkeleton only when expand view needs it
// Using specific import path to avoid bundling heavy feed components
const LazyFeedSkeleton = lazy(() =>
  import('@genuin/components/templates/feed/feed-skeleton').then((m) => ({
    default: m.FeedSkeleton,
  })),
)

/**
 * React-based expand view skeleton (loaded after providers are available)
 */
function ExpandViewSkeleton({ theme }: { theme?: 'dark' | 'light' }) {
  const bgClass =
    theme === 'dark' ? 'gencl:bg-secondary-900' : 'gencl:bg-secondary-50'
  return (
    <div
      className={`gencl:fixed gencl:inset-0 gencl:h-full gencl:w-full gencl:z-50 ${bgClass}`}>
      <Suspense fallback={null}>
        <LazyFeedSkeleton
          theme={theme}
          variant='fullscreen'
          showCommentsSkeleton={false}
        />
      </Suspense>
    </div>
  )
}

export async function loadNewEmbed({
  container,
  embedData,
  brandDetails,
  config,
  user,
  wasLazilyLoaded,
}: {
  container: HTMLElement
  embedData: EmbedDataType
  brandDetails: BrandDetailsConfigType
  config: Partial<SingleEmbedDataConfig>
  user?: AuthUser | null
  wasLazilyLoaded?: boolean
}): Promise<() => void> {
  // Performance marker: Embed render start
  const embedId = embedData.embed_id || embedData.placement_id || 'unknown'
  metrics.markEmbedRenderStart(embedId)

  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container)
  if (prevRoot) {
    prevRoot.unmount()
    containerRootMap.delete(container)
  }

  // Load all providers (no longer lazy loaded)
  // enable the shadow dom for the brand Id : 2477 for the temporary bases
  if (brandDetails.brand_id === 2477 || brandDetails.brand_id === 3099) {
    config.useShadowDOM = true
  }

  let targetContainer = container

  if (config.useShadowDOM) {
    targetContainer = setupMainShadowDOM(container)
  }

  const root = createRoot(targetContainer)
  containerRootMap.set(container, root)

  // Determine brand layout type
  const isPlacementView = !!embedData.placement_id
  const cardLayoutId = isPlacementView
    ? embedData.placement_card_layout_id
    : embedData.card_layout_id
  const videoLayoutId = isPlacementView
    ? embedData.placement_video_layout_id
    : embedData.video_layout_id
  const brandLayoutType = getBrandType(
    cardLayoutId ? Number(cardLayoutId) : undefined,
    videoLayoutId ? Number(videoLayoutId) : undefined,
  )

  // Initialize toaster on first embed
  if (!toasterRoot) {
    const div = document.createElement('div')
    div.id = 'gen-sdk-toaster-root'
    div.classList.add('gen-sdk-class')
    div.classList.add('gen-sdk-root-portal')
    document.body.appendChild(div)
    toasterRoot = createRoot(div)
    toasterRoot.render(
      <Suspense fallback={null}>
        <LazyToaster />
      </Suspense>,
    )
  }

  const rootToRender: ReactNode = (
    <ReactQueryClientProvider>
      <EmbedProvider
        container={targetContainer}
        trackObservability={
          (brandDetails.track_observability_enabled ?? true) &&
          TRACK_OBSERVABILITY === 'true'
        }
        sdkInitTime={Genuin.getSDKInitTime()}
        embedData={{
          ...embedData,
          brand_id: embedData.brand_id,
          action: embedData.autoUserInteractionToPerform,
          initialVideoIds: config.initialVideoIds,
          videoIds: config.videoIds,
          websiteType: config.websiteType,
          configs: {
            allowGestureScroll: config.allowGestureScroll,
          },
        }}
        brandLayoutType={brandLayoutType}>
        <BaseContextProvider
          brandDetails={brandDetails}
          theme={config.theme}
          useShadowDOM={config.useShadowDOM ?? false}
          isEmbed>
          <LinkProvider>
            <AnalyticsProvider
              embedData={embedData}
              isWebSDK={true}
              user={user ?? null}
              brandDetails={brandDetails}>
              <AuthProvider
                onSignIn={() => {}}
                onSignOut={() => {}}
                onUpdateUser={() => {}}
                user={user}>
                <Suspense
                  fallback={
                    <EmbedSkeleton
                      theme={config.theme}
                      container={container}
                    />
                  }>
                  {embedData.style === 'standard_wall' ? (
                    <LazyStandardWall />
                  ) : (
                    <LazyEmbed wasLazilyLoaded={wasLazilyLoaded} />
                  )}
                </Suspense>
                {config.useShadowDOM && (
                  <Suspense fallback={null}>
                    <LazyToaster />
                  </Suspense>
                )}
              </AuthProvider>
            </AnalyticsProvider>
          </LinkProvider>
        </BaseContextProvider>
      </EmbedProvider>
    </ReactQueryClientProvider>
  )

  root.render(rootToRender)

  // Performance marker: Embed render end (after React render)
  // Use requestAnimationFrame to ensure render is complete
  requestAnimationFrame(() => {
    metrics.markEmbedRenderEnd(embedId)
  })

  // Return cleanup function
  return () => {
    root.unmount()
    containerRootMap.delete(container)

    // Cleanup toaster when no embeds remain
    if (containerRootMap.size === 0 && toasterRoot && !config.useShadowDOM) {
      toasterRoot.unmount()
      document.getElementById('gen-sdk-toaster-root')?.remove()
      toasterRoot = null
    }

    const rootNode = container.getRootNode()
    if (
      rootNode instanceof ShadowRoot &&
      (rootNode as ShadowRoot).host.hasAttribute('data-genuin-host')
    ) {
      ;(rootNode as ShadowRoot).host.remove()
    } else {
      container.remove()
    }

    // Clean up overlay shadow host ONLY if this was the last embed
    // Clean up overlay shadow host if no other instances are using it
    const remainingInstances = document.querySelectorAll('[data-genuin-host]')
    if (remainingInstances.length === 0) {
      // NOTE: Cleanup is handled in the root portal component; this is kept as a safeguard.
      cleanupOverlayShadowHost()
    }
  }
}
