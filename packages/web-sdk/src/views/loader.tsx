import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from '../components/error-boundary'
import {
  MEDIA_BASE_URL,
  RUDDERSTACK_API_KEY,
  RUDDERSTACK_URL,
  SDK_VERSION,
  UNIQUE_USER_ID_KEY,
} from '@/const'
import { AuthUser, EmbedDataType } from '@/type'
import { Feed } from './feed'
import './output.css'
import { Analytics, ANALYTICS_DATA, getIpAddress } from '@/analytics'
import { AuthProvider } from '@/context/auth'
import { setBaseHeaders } from '@/headers'
import { BaseContextProvider, useBaseContext } from '@/context/base'
import { FullScreenModalProvider } from '@/context/full-screen'
import { FloatingViewProvider } from '@/context/floating'
import { FullScreenModal } from '@/components/full-screen-modal'
import { FloatingView } from './floating'
import { Carousel } from './carousel'
import { InitialLoader } from '@/components/initial-loader'
import { UrlParamProvider } from '@/utils/ssai/urlParamResolver'
import { ErrorBoundaryUi } from '@/components/error-boundary'
import { Shimmer } from '@/components/shimmer'
import { cn, getSlidesPerView } from '@/utils'
import { NoContents } from '@/components/no-contents'
import { Routes } from '@/router'
import { BrandDetailsProvider } from '@/context/brand-details'
import { SizeProvider } from '@/context/size'
import { Toaster } from '@/components/ui/toaster'
import { RepostModal } from '@/components/repost'
import { ReactQueryProvider } from '@/context/react-query'
import { ExpandViewProvider } from '@/context/expand-view'
import { useAuthModalContext } from '@/components/authentication/context'
import { AuthenticationModal } from '@/components/authentication'

export async function loadEmbedView(
  container: HTMLElement,
  embedData: EmbedDataType,
  user?: AuthUser,
  brandName?: string | null,
) {
  console.log('embedData :>> ', embedData)
  const root = createRoot(container)
  setAnalyticsData(embedData, user)
  root.render(<InitialLoader />)

  await Promise.all([
    (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') &&
      loadMainCSS(),
    loadOpenPlayerJS(),
    loadSwiperJS(),
    loadFingerprintJS(),
  ])
  getIpAddressAndIdentifyUser()

  // Set the base headers for the API calls.
  setBaseHeaders({
    brandId: String(embedData.brandDetails?.brand_id),
  })

  container.classList.contains('gen-sdk-class')
    ? undefined
    : container.classList.add('gen-sdk-class')
  if (embedData.customization) {
    embedData.customization.element = container
    embedData.customization.view = embedData.style
  }
  // Initialize is added as requested we can discuss and check if EmbedViewed can be removed
  Analytics.track(Analytics.EventNames.Initialized)

  root.render(
    <ErrorBoundary>
      <UrlParamProvider name={brandName ?? 'begenuin'}>
        <Providers
          user={user}
          embedData={embedData}
          enableFullScreen={
            embedData.style !== 'standard_wall' &&
            embedData.customization.is_popup_view
          }>
          {embedData.style === 'carousel' && <Carousel />}
          {embedData.style === 'feed' && <Feed />}
          {embedData.style === 'standard_wall' && <Routes />}
          <Toaster />
        </Providers>
      </UrlParamProvider>
    </ErrorBoundary>,
  )
}

type ProvidersPropsType = {
  children: React.ReactNode
  user?: AuthUser
  embedData: EmbedDataType
  /**
   * Enable full screen modal,
   * default is true
   */
  enableFullScreen?: boolean
}

function Providers({
  children,
  user,
  embedData,
  enableFullScreen = true,
}: ProvidersPropsType) {
  return (
    <BaseContextProvider embedData={embedData}>
      <ExpandViewProvider>
        <ReactQueryProvider>
          <BrandDetailsProvider
            customizations={embedData.customization}
            brandDetails={embedData.brandDetails}
            embedStyle={embedData.style}>
            <AuthProvider
              brandId={embedData.brand_id}
              user={user}>
              <SizeProvider>
                <RenderComponents
                  embedData={embedData}
                  enableFullScreen={enableFullScreen}
                  isFloatingViewEnabled={
                    embedData.customization?.is_floating_view
                  }>
                  {children}
                </RenderComponents>
              </SizeProvider>
            </AuthProvider>
          </BrandDetailsProvider>
        </ReactQueryProvider>
      </ExpandViewProvider>
    </BaseContextProvider>
  )
}

type RenderComponentsPropsType = {
  children: React.ReactNode
  enableFullScreen?: boolean
  isFloatingViewEnabled?: boolean
  embedData: EmbedDataType
}

function RenderComponents({
  embedData,
  ...restProps
}: RenderComponentsPropsType) {
  const { isLoading, videos } = useBaseContext()
  const [inViewFirstTime, setIsInViewFirstTime] = useState(false)
  const authModal = useAuthModalContext()
  AuthenticationModal.setInstance(authModal)

  useEffect(() => {
    const element = embedData.customization?.element
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewFirstTime(true)
            Analytics.track(Analytics.EventNames.EmbedViewed)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.01 },
    )
    observer.observe(element)
  }, [])

  if (embedData.style === 'standard_wall') {
    return (
      <Content
        {...restProps}
        showPopupByDefault={
          embedData.customization.is_show_popup_by_default ?? false
        }
      />
    )
  }

  if (isLoading || !inViewFirstTime) {
    const element = embedData.customization?.element
    const forFeed = embedData.style === 'feed'
    const slidesPerView = element ? getSlidesPerView(element, forFeed) : 2
    return (
      <div
        className={cn(
          'flex h-full w-full gap-2 p-2',
          forFeed ? 'flex-col' : 'flex-row',
        )}>
        {Array.from({ length: slidesPerView + 1 }).map((_item, index) => {
          return (
            <Shimmer
              key={index}
              style={{ borderRadius: 8 }}
            />
          )
        })}
      </div>
    )
  }

  if (videos.length === 0) {
    return <NoContents />
  }
  return (
    <Content
      {...restProps}
      showPopupByDefault={
        embedData.customization.is_show_popup_by_default ?? false
      }
    />
  )
}

type ContentPropsType = Omit<RenderComponentsPropsType, 'embedData'> & {
  showPopupByDefault: boolean
}

function Content({
  children,
  enableFullScreen,
  isFloatingViewEnabled,
  showPopupByDefault,
}: ContentPropsType) {
  return (
    <>
      {/* To check whether full screen should be enabled or not. */}
      {enableFullScreen ? (
        <FullScreenModalProvider defaultOpen={showPopupByDefault}>
          {/* To check whether floating view should be enabled or not. */}
          {isFloatingViewEnabled ? (
            <FloatingViewProvider>
              {children}
              <FloatingView />
            </FloatingViewProvider>
          ) : (
            children
          )}
          <FullScreenModal />
        </FullScreenModalProvider>
      ) : isFloatingViewEnabled ? (
        <FloatingViewProvider>
          {children}
          <FloatingView />
        </FloatingViewProvider>
      ) : (
        children
      )}
    </>
  )
}

function getIpAddressAndIdentifyUser() {
  getIpAddress().then((ip) => {
    if (ip) {
      const proxyWindow = window as any
      proxyWindow.rudderanalytics.identify(
        localStorage.getItem(UNIQUE_USER_ID_KEY),
        { ip },
        {
          ip: ip,
        },
      )
    }
  })
}

function setAnalyticsData(
  embedData: EmbedDataType,
  user: AuthUser | null = null,
) {
  ANALYTICS_DATA['brand_id'] = embedData.brandDetails?.brand_id
  ANALYTICS_DATA['embed_id'] = embedData.embed_id
  ANALYTICS_DATA['user_id'] = user
    ? user.id
    : localStorage.getItem(UNIQUE_USER_ID_KEY) || ''
  ANALYTICS_DATA['embed_type'] = embedData.type
  ANALYTICS_DATA['embed_style'] = embedData.style
  ANALYTICS_DATA['phone_no'] = user?.phoneNumber ?? ''
  ANALYTICS_DATA['sdk_version'] = SDK_VERSION
  ANALYTICS_DATA['user_name'] = user?.name ?? ''
  ANALYTICS_DATA['gen_user_id'] = user?.id ?? ''
  ANALYTICS_DATA['gen_user_name'] = user?.name ?? ''
  ANALYTICS_DATA['environment'] = embedData.environment ?? ''
}

function loadMainCSS() {
  return new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `${MEDIA_BASE_URL}/sdk/gen-sdk.css`
    link.onload = () => {
      resolve(true)
    }
    document.head.appendChild(link)
  })
}

export async function loadRudderStack() {
  const script = document.createElement('script')
  script.innerText = `!function(){"use strict";window.RudderSnippetVersion="3.0.3",window.rudderAnalyticsBuildType="legacy",window.rudderanalytics=[];for(var e=["setDefaultInstanceKey","load","ready","page","track","identify","alias","group","reset","setAnonymousId","startSession","endSession","consent",],t=0;t<e.length;t++){var a=e[t];window.rudderanalytics[a]=function(e){return function(){window.rudderanalytics.push([e].concat(Array.prototype.slice.call(arguments)))}}(a)}try{Function('return import("")'),window.rudderAnalyticsBuildType="modern"}catch(r){}if(window.rudderAnalyticsMount=function(){"undefined"==typeof globalThis&&(Object.defineProperty(Object.prototype,"__globalThis_magic__",{get:function e(){return this},configurable:!0}),__globalThis_magic__.globalThis=__globalThis_magic__,delete Object.prototype.__globalThis_magic__);var e=document.createElement("script");e.src="".concat("https://cdn.rudderlabs.com/v3","/").concat(window.rudderAnalyticsBuildType,"/").concat("rsa.min.js"),e.async=!0,document.head?document.head.appendChild(e):document.body.appendChild(e)},"undefined"==typeof Promise||"undefined"==typeof globalThis){var n=document.createElement("script");n.src="https://polyfill-fastly.io/v3/polyfill.min.js?version=3.111.0&features=Symbol%2CPromise&callback=rudderAnalyticsMount",n.async=!0,document.head?document.head.appendChild(n):document.body.appendChild(n)}else window.rudderAnalyticsMount();window.rudderanalytics.load("${RUDDERSTACK_API_KEY}","${RUDDERSTACK_URL}",{storage:{type:"localStorage",cookie:{},entries:{userId:{type:"localStorage"},anonymousId:{type:"localStorage"},sessionInfo:{type:"localStorage"},userTraits:{type:"localStorage"},initialReferrer:{type:"localStorage"},groupId:{type:"localStorage"},groupTraits:{type:"localStorage"},initialReferringDomain:{type:"localStorage"},authToken:{type:"localStorage"}}},plugins:["DeviceModeDestinations","ErrorReporting"],consentManagement:{enabled:!1},integrations:{All:!1,"Google Analytics":!1}})}();`
  document.body.appendChild(script)
}

function loadFingerprintJS() {
  return new Promise((resolve) => {
    const uniqueUserId = localStorage.getItem(UNIQUE_USER_ID_KEY)
    if (uniqueUserId) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src =
      'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4.4.3/dist/fp.min.js'
    script.async = false
    script.onload = () => {
      const fpPromise = (window as any).FingerprintJS.load()
      fpPromise
        .then((fp: any) => fp.get())
        .then((result: any) => {
          localStorage.setItem(UNIQUE_USER_ID_KEY, result.visitorId)
          resolve(true)
        })
    }
    document.body.appendChild(script)
  })
}

async function loadSwiperJS() {
  return new Promise((resolve) => {
    loadSwiperCSS()
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
    script.async = false
    script.onload = () => {
      resolve(true)
    }
    // script.fetchPriority = 'high'
    document.body.appendChild(script)
  })
}

function loadSwiperCSS() {
  return new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
    link.onload = () => {
      resolve(true)
    }
    // link.fetchPriority = 'high'
    document.head.appendChild(link)
  })
}

function loadOpenPlayerJS() {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src =
      'https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js'
    script.async = false
    script.onload = () => {
      resolve(true)
    }
    // script.fetchPriority = 'high'
    document.body.appendChild(script)
  })
}

export function loadErrorView(container: HTMLElement) {
  const root = createRoot(container)
  root.render(<ErrorBoundaryUi />)
}
