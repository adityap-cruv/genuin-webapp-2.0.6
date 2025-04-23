import { Route, Switch } from 'wouter'
import { ProfilePage } from '@/pages/profile'
import { BrandPage } from '@/pages/brand'
import { HomePage } from '@/pages/home'
import { PopularPage } from '@/pages/popular'
import { LatestPage } from '@/pages/latest'
import { CommunityPage } from '@/pages/community'
import { GroupPage } from '@/pages/group'
import { PageNotFound } from '@/components/page-not-found'
import { ExplorePage } from '@/pages/explore'
import { Notifications } from '@/pages/notification'
import { RouterProvider } from './context'
import { PageShell } from '@/components/page-shell'
import { SettingsPage } from '@/pages/settings'
import { VideoPage } from '@/pages/video'
import { RouteMiddleware } from './middleware'

export const ROUTES = {
  SETTINGS: '/settings/:subpage?',
  HOME: '/home',
  POPULAR: '/popular',
  LATEST: '/latest',
  BRAND: '/brand/:slug',
  PROFILE: '/profile/:slug',
  COMMUNITY: '/community/:slug',
  GROUP: '/group/:slug',
  VIDEO: '/video/:slug',
  EXPLORE: '/explore',
  NOTIFICATION: '/notification',
  NOT_FOUND: '/not-found',
} as const

type RouteValues = (typeof ROUTES)[keyof typeof ROUTES]

// Static routes without parameters
const STATIC_ROUTES: RouteValues[] = [
  ROUTES.HOME,
  ROUTES.POPULAR,
  ROUTES.LATEST,
  ROUTES.EXPLORE,
  ROUTES.NOTIFICATION,
]

// Dynamic routes with parameters
const DYNAMIC_ROUTES: RouteValues[] = [
  ROUTES.SETTINGS,
  ROUTES.BRAND,
  ROUTES.PROFILE,
  ROUTES.COMMUNITY,
  ROUTES.GROUP,
  ROUTES.VIDEO,
]

/**
 * Validates if a given path is a valid route in the application
 */
export const isValidRoute = (path: string): boolean => {
  // Check static routes first
  if (STATIC_ROUTES.includes(path as RouteValues)) {
    return true
  }

  // Check dynamic routes
  return DYNAMIC_ROUTES.some((route) => {
    const routePrefix = route.split('/:')[0]
    return path.startsWith(routePrefix)
  })
}

/**
 * Renders the main routes of the application.
 *
 * @returns The routes component.
 */
export function Routes() {
  return (
    <RouterProvider>
      <RouteMiddleware>
        {/* @ts-ignore */}
        <Switch>
          {/* @ts-ignore */}
          <Route path={ROUTES.SETTINGS}>
            {(params) => {
              return (
                <PageShell.settings>
                  <SettingsPage path={params?.subpage as any} />
                </PageShell.settings>
              )
            }}
          </Route>
          <PageShell.default>
            {/* @ts-ignore */}
            <Route path={ROUTES.HOME}>
              <HomePage />
            </Route>
            <Route path={ROUTES.POPULAR}>
              <PopularPage />
            </Route>
            <Route path={ROUTES.LATEST}>
              <LatestPage />
            </Route>
            <Route path={ROUTES.BRAND}>
              {(params) => <BrandPage slug={params.slug} />}
            </Route>
            <Route path={ROUTES.PROFILE}>
              {(params) => <ProfilePage slug={params.slug} />}
            </Route>
            <Route path={ROUTES.COMMUNITY}>
              {(params) => <CommunityPage slug={params.slug} />}
            </Route>
            <Route path={ROUTES.GROUP}>
              {(params) => <GroupPage slug={params.slug} />}
            </Route>
            <Route path={ROUTES.VIDEO}>
              {(params) => <VideoPage slug={params.slug} />}
            </Route>
            <Route path={ROUTES.EXPLORE}>
              <ExplorePage />
            </Route>
            <Route path={ROUTES.NOTIFICATION}>
              <Notifications />
            </Route>
            <Route path={ROUTES.NOT_FOUND}>
              <PageNotFound errorMessage='Page not found!' />
            </Route>
          </PageShell.default>
        </Switch>
      </RouteMiddleware>
    </RouterProvider>
  )
}
