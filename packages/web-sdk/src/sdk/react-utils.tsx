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
export function loadLoadingView(container: HTMLElement): void {
  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container)
  if (prevRoot) {
    prevRoot.unmount()
    containerRootMap.delete(container)
  }

  const root = createRoot(container)
  containerRootMap.set(container, root)

  root.render(<EmbedSkeleton />)
}

// Expand view function
export function loadExpandView(container: HTMLElement): void {
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

  window.genuin?.on?.(SDKEventType.SDK_EXPAND_VIEW_LOADED, () => {
    if (loaderDiv) {
      document.body.removeChild(loaderDiv)
      root.unmount()
    }
  })
  root.render(<ExpandViewSkeleton />)
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
const EmbedSkeleton = () => (
  <div className='gencl:flex gencl:relative gencl:h-full gencl:w-full gencl:bg-secondary-50 gencl:rounded-md'>
    <Loader
      size='md'
      className='gencl:absolute gencl:top-1/2 gencl:left-1/2 gencl:-translate-x-1/2 gencl:-translate-y-1/2'
    />
  </div>
)

const ExpandViewSkeleton = () => {
  return (
    <div className='gencl:fixed gencl:inset-0 gencl:h-full gencl:w-full gencl:z-50'>
      <FeedSkeleton variant='fullscreen' />
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
}): void {
  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container)
  prevRoot?.unmount()
  containerRootMap.delete(container)

  const root = createRoot(container)
  containerRootMap.set(container, root)

  const rootToRender = (
    <ReactQueryClientProvider>
      <EmbedProvider
        container={container}
        embedData={{
          ...embedData,
          brand_id: embedData.brand_id,
          action: embedData.autoUserInteractionToPerform,
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
              <AnalyticsProvider embedData={embedData} isWebSDK={true}>
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
