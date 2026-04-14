import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { Suspense, lazy, type ReactNode } from 'react'
import { BrandDetailsConfigType } from '@genuin/components/types/brand'
import { AuthUser } from '@genuin/components/types/auth'
import { SingleEmbedDataConfig } from '@/type'
import { SDKEventType } from '@/core'
import { metrics } from '../utils/metrics'
import { generateExpandViewSkeletonHTML } from '../utils/skeleton-html'
import {
  cleanupOverlayShadowHost,
  ensureStylesInShadowRoot,
} from '@genuin/components/molecules/root-portal/shadow-root/shadow-dom.utils'

import { useDeviceDetectMediaQuery } from '@genuin/components/hooks/use-devide-detect-media-query'
import { Skeleton } from '@genuin/ui/components/skeleton'
import { cn } from '@genuin/ui'
import { getBrandType } from '@genuin/components/lib/utils/brand-layout'
import { Loader } from '@genuin/ui/components/loader'
// Lazy load Toaster for better code splitting
export const LazyToaster = lazy(() =>
  import('@genuin/ui/components/toaster').then((module) => ({
    default: module.Toaster,
    then: () => {
      // Ensure required styles are injected into all relevant shadow roots
      const injectStylesIntoShadowRoots = () => {
        const mainHost = document.querySelector('[data-genuin-host]')
        if (mainHost?.shadowRoot) {
          void ensureStylesInShadowRoot(mainHost.shadowRoot)
        }

        const overlayHost = document.querySelector('[data-genuin-overlay-host]')
        if (overlayHost?.shadowRoot) {
          void ensureStylesInShadowRoot(overlayHost.shadowRoot)
        }
      }

      // Inject styles once the toaster module is loaded
      injectStylesIntoShadowRoots()
    },
  }))
)

// Lazy load EmbedRoot for better code splitting
const LazyEmbedRoot = lazy(() =>
  import('./embed-root').then((module) => ({
    default: module.EmbedRoot,
  }))
)

// Track React roots per container to support multiple embeds
const containerRootMap = new Map<HTMLElement, Root>()
// Remember whether a container created its own shadow host so cleanup
// doesn't tear down shared hosts in nested embed scenarios.
const containerOwnsHostMap = new WeakMap<HTMLElement, boolean>()

// Global toaster singleton
let toasterRoot: Root | null = null

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
            !isDesktop && websiteType === 'polaris' && 'gencl:flex-col'
          )}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className={cn(
                'gencl:aspect-square gencl:flex-shrink-0 gencl:rounded-md',
                !isDesktop && websiteType === 'polaris'
                  ? 'gencl:w-full'
                  : 'gencl:h-full',
                shimmerBgClass
              )}
            />
          ))}
        </div>
      ) : (
        <div className='gencl:flex gencl:items-center gencl:justify-center gencl:h-full gencl:w-full'>
          <Loader size='md' />
        </div>
      )}
    </div>
  )
}

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
  theme?: 'dark' | 'light'
): void {
  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container)
  if (prevRoot) {
    prevRoot.unmount()
    containerRootMap.delete(container)
    const ownsShadowHost = containerOwnsHostMap.get(container) ?? false
    containerOwnsHostMap.delete(container)
  }

  const root = createRoot(container)
  containerRootMap.set(container, root)

  root.render(
    <EmbedSkeleton
      container={container}
      theme={theme}
    />
  )
}

// Expand view function
export function loadExpandView(
  container: HTMLElement,
  theme?: 'dark' | 'light',
  /**
   * The shadow root to render the expand loader inside.
   * When provided (always the case after the Shadow DOM refactor) the loader div is
   * appended to the shadow root instead of document.body, so it is scoped to the embed.
   */
  shadowRoot?: ShadowRoot | null
): void {
  if (container.getAttribute('data-web-sdk-nested') === 'true') {
    return
  }

  const loaderId = 'gen-sdk-expand-view-loader'

  // Prefer shadow-root-scoped lookup when a shadow root is provided
  let loaderDiv = (
    shadowRoot
      ? (shadowRoot.getElementById(loaderId) as HTMLElement | null)
      : document.getElementById(loaderId)
  ) as HTMLElement | null

  if (!loaderDiv) {
    loaderDiv = document.createElement('div')
    loaderDiv.id = loaderId
    loaderDiv.classList.add('loader')
    loaderDiv.classList.add('gen-sdk-class')
    loaderDiv.classList.add('gen-sdk-root-portal')
    loaderDiv.style.position = 'fixed'
    loaderDiv.style.zIndex = '30'
    loaderDiv.style.top = '0'
    loaderDiv.style.left = '0'
    loaderDiv.style.width = '100%'
    loaderDiv.style.height = '100%'

    if (shadowRoot) {
      shadowRoot.appendChild(loaderDiv)
    } else {
      document.body.appendChild(loaderDiv)
    }
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
  Remove or unmount the loader div when the SDK_EXPAND_VIEW_CHANGED event is emitted,
  indicating that the expand view has successfully loaded.
  */
  const cleanup = () => {
    if (loaderDiv) {
      // Small delay before cleanup to ensure smooth transition
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
      if (payload.payload) {
        cleanup()
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    }
  )

  // Use HTML/CSS skeleton for fast initial render — no React needed here
  loaderDiv.innerHTML = generateExpandViewSkeletonHTML({ theme })
}

// Lazy load FeedSkeleton only when expand view needs it
// Using specific import path to avoid bundling heavy feed components
const LazyFeedSkeleton = lazy(() =>
  import('@genuin/components/templates/feed/feed-skeleton').then((m) => ({
    default: m.FeedSkeleton,
  }))
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
  shadowTarget,
  embedData,
  brandDetails,
  config,
  user,
  wasLazilyLoaded,
  isOnlyForExpand,
}: {
  container: HTMLElement
  /** The element inside the already-created Shadow DOM to mount React into. */
  shadowTarget: HTMLElement
  embedData: EmbedDataType
  brandDetails: BrandDetailsConfigType
  config: Partial<SingleEmbedDataConfig>
  user?: AuthUser | null
  wasLazilyLoaded?: boolean
  isOnlyForExpand?: boolean
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

  // useShadowDOM is already resolved to its final boolean value by genuin-sdk.ts
  // (default true, overridable via configByUser.useShadowDOM = false).
  // shadowTarget is the React mount point: the shadow root inner element when
  // Shadow DOM is on, or the host element itself when it is off.

  const root = createRoot(shadowTarget)
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
    videoLayoutId ? Number(videoLayoutId) : undefined
  )

  // Initialize toaster on first embed
  if (!toasterRoot && !config.useShadowDOM) {
    const div = document.createElement('div')
    div.id = 'gen-sdk-toaster-root'
    div.classList.add('gen-sdk-class')
    div.classList.add('gen-sdk-root-portal')
    document.body.appendChild(div)
    toasterRoot = createRoot(div)
    toasterRoot.render(
      <Suspense fallback={null}>
        <LazyToaster />
      </Suspense>
    )
  }

  // Remove the HTML skeleton that was injected into the shadow root before React mounted.
  // Called once by EmbedRoot on its first render via the onContentReady prop.
  const handleContentReady = () => {
    const shadowRoot = container.shadowRoot
    if (!shadowRoot) return
    const skeleton = shadowRoot.querySelector('.gen-sdk-skeleton-container')
    if (skeleton) {
      skeleton.remove()
    }
    window.genuin?.emitInternal?.(SDKEventType.SDK_EMBED_CONTENT_READY, {
      instanceId: container.getAttribute('data-instance-id'),
    })
  }

  const rootToRender: ReactNode = (
    <Suspense
      fallback={
        <EmbedSkeleton
          theme={config.theme}
          container={container}
        />
      }>
      <LazyEmbedRoot
        targetContainer={shadowTarget}
        container={container}
        embedData={embedData}
        brandDetails={brandDetails}
        config={config}
        user={user}
        wasLazilyLoaded={wasLazilyLoaded}
        brandLayoutType={brandLayoutType}
        isOnlyForExpand={isOnlyForExpand}
        onContentReady={handleContentReady}
      />
    </Suspense>
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
    containerOwnsHostMap.delete(container)

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
