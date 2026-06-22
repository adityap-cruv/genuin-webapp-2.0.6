import { Toaster } from "@genuin/ui";
import type { ComponentProps } from "react";
import { useEffect, useState, lazy } from "react";
import { Route, Router, Switch } from "wouter";

import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useRouter } from "@genuin/components/hooks/use-router";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { BaseLayout } from "@genuin/components/templates/base-layout";
import { Feed } from "@genuin/components/templates/feed";

type StandardWallProps = {
  /**
   * Optional prop to specify the initial path for the Standard Wall component.
   */
  startingPath?: string; // Optional prop to specify the initial path
  defaultComponent?: React.ReactNode;
  baseLayoutVariant?: ComponentProps<typeof BaseLayout>["variant"];
} & ComponentProps<"div">;

const ProfileDetails = lazy(() =>
  import("../profile-details").then((m) => ({
    default: m.ProfileDetails,
  }))
);
const GroupDetailsPage = lazy(() =>
  import("../group-details/group-details").then((m) => ({
    default: m.GroupDetailsPage,
  }))
);
const CommunityDetails = lazy(() =>
  import("../community-details").then((m) => ({
    default: m.CommunityDetails,
  }))
);
const VideoPage = lazy(() => import("../video").then((m) => ({ default: m.VideoPage })));
const SettingsPage = lazy(() =>
  import("@genuin/components/organisms/settings").then((m) => ({
    default: m.SettingsPage,
  }))
);
const Explore = lazy(() => import("../explore").then((m) => ({ default: m.Explore })));
// const MyVideos = lazy(() => import("@genuin/components/organisms/my-videos"));
// const CreatePost = lazy(
//   () => import("@genuin/components/organisms/create-post")
// );

/**
 * Standard Wall component that serves as the main entry point for the application.
 * It sets up the routing for various pages such as home, latest, popular feeds, profile details, group details, community details, video page, and settings page.
 * It uses the `embedRouter` to handle routing and `BaseLayout` for consistent layout across the application.
 */
export function StandardWall({ startingPath, defaultComponent, baseLayoutVariant, ...restProps }: StandardWallProps) {
  const router = useRouter();
  const embedRouter = useSafeEmbedContext()?.embedRouter;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (defaultComponent) {
      router?.replace("/default-comp");
    }
    setShouldRender(true);
  }, []);

  if (shouldRender)
    return (
      <div className="gencl:w-full gencl:h-full gencl:relative" {...restProps}>
        <Router hook={embedRouter?.hook}>
          <Switch>
            <Route path={buildPageUrl({ type: "home" })}>
              <BaseLayout>
                <Feed feedType="HOME" />
              </BaseLayout>
            </Route>
            <Route path="/default-comp">{defaultComponent}</Route>
            <Route>
              <BaseLayout variant={baseLayoutVariant}>
                <Switch>
                  <Route path={buildPageUrl({ type: "latest" })}>
                    <Feed feedType="LATEST" />
                  </Route>
                  <Route path={buildPageUrl({ type: "popular" })}>
                    <Feed feedType="POPULAR" />
                  </Route>
                  <Route
                    path={buildPageUrl({
                      type: "profile",
                      asRoutePattern: true,
                    })}>
                    {(params) => {
                      return (
                        <SafeSuspense fallback={null} errorFallback={null}>
                          <ProfileDetails userName={(params as any).slug} forBrand={false} />
                        </SafeSuspense>
                      );
                    }}
                  </Route>
                  <Route path={buildPageUrl({ type: "brand", asRoutePattern: true })}>
                    {(params) => {
                      return (
                        <SafeSuspense fallback={null} errorFallback={null}>
                          <ProfileDetails userName={(params as any).slug} forBrand={true} />
                        </SafeSuspense>
                      );
                    }}
                  </Route>
                  <Route path={buildPageUrl({ type: "group", asRoutePattern: true })}>
                    {(params) => {
                      return (
                        <SafeSuspense fallback={null} errorFallback={null}>
                          <GroupDetailsPage slug={(params as any).slug} />
                        </SafeSuspense>
                      );
                    }}
                  </Route>
                  <Route
                    path={buildPageUrl({
                      type: "community",
                      asRoutePattern: true,
                    })}>
                    {(params) => {
                      return (
                        <SafeSuspense fallback={null} errorFallback={null}>
                          <CommunityDetails slug={(params as any).slug} />
                        </SafeSuspense>
                      );
                    }}
                  </Route>
                  <Route path={buildPageUrl({ type: "video", asRoutePattern: true })}>
                    {(params) => {
                      return (
                        <SafeSuspense fallback={null} errorFallback={null}>
                          <VideoPage videoId={(params as any).slug} />
                        </SafeSuspense>
                      );
                    }}
                  </Route>
                  <Route path={buildPageUrl({ type: "settings" })}>
                    <SafeSuspense fallback={null} errorFallback={null}>
                      <SettingsPage />
                    </SafeSuspense>
                  </Route>
                  <Route path={buildPageUrl({ type: "explore" })}>
                    <SafeSuspense fallback={null} errorFallback={null}>
                      <Explore />
                    </SafeSuspense>
                  </Route>
                  {/* <Route path={buildPageUrl({ type: "posts-create" })}>
              <SafeSuspense fallback={null} errorFallback={null}>
                <CreatePost />
              </SafeSuspense>
            </Route> */}
                  {/* <Route path={buildPageUrl({ type: "posts" })}>
              <SafeSuspense fallback={null} errorFallback ={null}>
                <MyVideos />
              </SafeSuspense>
            </Route> */}
                  {/* <Route path={buildPageUrl({ type: "post", asRoutePattern: true })}>
              {(params) => {
                return (
                  <SafeSuspense fallback={null} errorFallback ={null}>
                    <CreatePost postId={(params as any).slug} />
                  </SafeSuspense>
                );
              }}
            </Route> */}
                  {/* <Route
              path={<buildPageUrl>({ type: "posts-draft", asRoutePattern: true })}
            >
              {(params) => {
                return (
                  <SafeSuspense fallback={null} errorFallback ={null}>
                    <CreatePost draftId={(params as any).slug} />
                  </SafeSuspense>
                );
              }}
            </Route> */}
                  {/* <Route path={"/create-post"}>
              <SafeSuspense fallback={null} errorFallback ={null}>
                <CreatePost />
              </SafeSuspense>
            </Route> */}
                </Switch>
              </BaseLayout>
            </Route>
          </Switch>
        </Router>
        <Toaster className="gencl:fixed gencl:bottom-0 gencl:right-0 gencl:z-50" />
      </div>
    );
}
