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

// Type definitions for lazy-loaded providers
interface ProviderModules {
  AuthProvider: ComponentType<any>
  BaseContextProvider: ComponentType<any>
  EmbedProvider: ComponentType<any>
  LinkProvider: ComponentType<any>
  ReactQueryClientProvider: ComponentType<any>
  AnalyticsProvider: ComponentType<any>
  Toaster: ComponentType<any>
  Loader: ComponentType<any>
  Skeleton: ComponentType<any>
  FeedSkeleton: ComponentType<any>
  getBrandType: (
    cardLayoutId?: number | null,
    videoLayoutId?: number | null,
  ) => string
  cn: (...args: any[]) => string
  useDeviceDetectMediaQuery: () => { isDesktop: boolean }
}

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

/**
 * Dynamically load all React providers
 * This defers loading of providers until embed is actually rendered
 */
async function loadProviders(): Promise<ProviderModules> {
  const [
    authModule,
    baseModule,
    embedModule,
    linkModule,
    queryModule,
    analyticsModule,
    // uiModule,
    brandUtilsModule,
    uiUtilsModule,
    hooksModule,
  ] = await Promise.all([
    import('@genuin/components/context/auth'),
    import('@genuin/components/context/base'),
    import('@genuin/components/context/embed'),
    import('@genuin/components/context/link'),
    import('@genuin/components/react-query/react-query-provider'),
    import('@genuin/components/context/analytics'),
    // import('@genuin/ui'),
    import('@genuin/components/lib/utils/brand-layout'),
    import('@genuin/ui/lib/utils'),
    import('@genuin/components/hooks/use-devide-detect-media-query'),
  ])

  // Lazy load UI components
  const [loaderModule, skeletonModule, feedSkeletonModule] = await Promise.all([
    import('@genuin/ui/components/loader'),
    import('@genuin/ui/components/skeleton'),
    import('@genuin/components/templates/feed'),
  ])

  return {
    AuthProvider: authModule.AuthProvider,
    BaseContextProvider: baseModule.BaseContextProvider,
    EmbedProvider: embedModule.EmbedProvider,
    LinkProvider: linkModule.LinkProvider,
    ReactQueryClientProvider: queryModule.ReactQueryClientProvider,
    AnalyticsProvider: analyticsModule.AnalyticsProvider,
    // Toaster: uiModule.Toaster,
    Toaster: (await import('@genuin/ui/components/toaster')).Toaster,
    Loader: loaderModule.Loader,
    Skeleton: skeletonModule.Skeleton,
    FeedSkeleton: feedSkeletonModule.FeedSkeleton,
    getBrandType: brandUtilsModule.getBrandType,
    cn: uiUtilsModule.cn,
    useDeviceDetectMediaQuery: hooksModule.useDeviceDetectMediaQuery,
  }
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
  providers,
}: {
  container: HTMLElement
  theme?: 'dark' | 'light'
  providers: ProviderModules
}) {
  const bgClass =
    theme === 'dark' ? 'gencl:bg-secondary-900' : 'gencl:bg-secondary-200'
  const shimmerBgClass =
    theme === 'dark' ? 'gencl:bg-secondary-800' : 'gencl:bg-secondary-100'
  const { isDesktop } = providers.useDeviceDetectMediaQuery()
  const websiteType = container.getAttribute('data-website-type')

  return (
    <div
      className={`gencl:relative gencl:h-full gencl:w-full gencl:rounded-md ${isDesktop && bgClass}`}>
      {websiteType ? (
        <div
          style={{
            height: !isDesktop ? '100%' : 'calc(100% - 68px)',
          }}
          className={providers.cn(
            'gencl:w-full gencl:flex gencl:overflow-auto gencl:gap-2',
            !isDesktop && websiteType === 'polaris' && 'gencl:flex-col',
          )}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <providers.Skeleton
              key={idx}
              className={providers.cn(
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
        <providers.Loader
          size='md'
          className='gencl:absolute gencl:top-1/2 gencl:left-1/2 gencl:-translate-x-1/2 gencl:-translate-y-1/2'
        />
      )}
    </div>
  )
}

/**
 * React-based expand view skeleton (loaded after providers are available)
 */
function ExpandViewSkeleton({
  theme,
  providers,
}: {
  theme?: 'dark' | 'light'
  providers: ProviderModules
}) {
  const bgClass =
    theme === 'dark' ? 'gencl:bg-secondary-900' : 'gencl:bg-secondary-50'
  return (
    <div
      className={`gencl:fixed gencl:inset-0 gencl:h-full gencl:w-full gencl:z-50 ${bgClass}`}>
      <providers.FeedSkeleton
        theme={theme}
        variant='fullscreen'
        showCommentsSkeleton={false}
      />
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

  // Dynamically load all providers (defers loading until embed is rendered)
  const providers = await loadProviders()

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
  const brandLayoutType = providers.getBrandType(
    cardLayoutId ? Number(cardLayoutId) : undefined,
    videoLayoutId ? Number(videoLayoutId) : undefined,
  )

  const {
    ReactQueryClientProvider,
    EmbedProvider,
    BaseContextProvider,
    LinkProvider,
    AuthProvider,
    AnalyticsProvider,
    Toaster,
  } = providers

  // Initialize toaster on first embed
  if (!toasterRoot) {
    const div = document.createElement('div')
    div.id = 'gen-sdk-toaster-root'
    div.classList.add('gen-sdk-class')
    div.classList.add('gen-sdk-root-portal')
    document.body.appendChild(div)
    toasterRoot = createRoot(div)
    toasterRoot.render(<Toaster />)
  }

  const rootToRender: ReactNode = (
    <ReactQueryClientProvider>
      <EmbedProvider
        container={container}
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
                      providers={providers}
                    />
                  }>
                  {embedData.style === 'standard_wall' ? (
                    <LazyStandardWall />
                  ) : (
                    <LazyEmbed wasLazilyLoaded={wasLazilyLoaded} />
                  )}
                </Suspense>
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
    if (containerRootMap.size === 0 && toasterRoot) {
      toasterRoot.unmount()
      document.getElementById('gen-sdk-toaster-root')?.remove()
      toasterRoot = null
    }
    container.remove()
  }
}
