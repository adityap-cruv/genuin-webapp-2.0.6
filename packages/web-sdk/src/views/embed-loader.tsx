import { AuthUser, EmbedDataType } from '@/type'
import { getKsCbRequestStatus } from '@/utils/auth'
import { createRoot } from 'react-dom/client'
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
import { FeedContextProvider } from '@genuin/components/templates/feed/context'

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
const EmbedSkeleton = ({
  containerStyle,
}: {
  containerStyle?: Record<string, string>
}) => (
  <div
    className='gencl:flex gencl:relative gencl:h-full gencl:w-full gencl:bg-secondary-50 gencl:rounded-md'
    style={containerStyle}>
    <Loader
      size='md'
      className='gencl:absolute gencl:top-1/2 gencl:left-1/2 gencl:-translate-x-1/2 gencl:-translate-y-1/2'
    />
  </div>
)

export function loadNewEmbed(
  container: HTMLElement,
  embedData: EmbedDataType,
  user?: AuthUser,
) {
  const root = createRoot(container)

  // Convert container inline styles to React style object
  const containerStyle: Record<string, string> = {}
  if (container.style) {
    for (let i = 0; i < container.style.length; i++) {
      const propertyName = container.style[i]
      if (propertyName) {
        const camelCaseName = propertyName.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase(),
        )
        containerStyle[camelCaseName] =
          container.style.getPropertyValue(propertyName)
      }
    }
  }

  const rootToRender = (
    <ReactQueryClientProvider>
      <EmbedProvider
        container={container}
        embedData={{
          ...embedData,
          brand_id: embedData.brandDetails.brand_id,
          autoUserInteractionToPerform: embedData.action as any,
        }}>
        <LinkProvider>
          <BaseContextProvider
            brandDetails={embedData.brandDetails}
            isEmbed>
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
                {/* REMOVE FeedContextProvider dependency  */}
                <FeedContextProvider
                  defaultExpandView={false}
                  onCloseExpandView={() => {}}>
                  <Suspense
                    fallback={
                      <EmbedSkeleton containerStyle={containerStyle} />
                    }>
                    {embedData.style === 'standard_wall' ? (
                      <LazyStandardWall style={containerStyle} />
                    ) : (
                      <LazyEmbed style={containerStyle} />
                    )}
                  </Suspense>
                  <Toaster />
                </FeedContextProvider>
              </AnalyticsProvider>
            </AuthProvider>
          </BaseContextProvider>
        </LinkProvider>
      </EmbedProvider>
    </ReactQueryClientProvider>
  )

  root.render(rootToRender)
}
