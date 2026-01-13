import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { BaseLayout } from "@genuin/components/templates/base-layout";
import { Feed } from "@genuin/components/templates/feed";
import { Route, Router } from "wouter";
import { ComponentProps, useEffect, useState, lazy, Suspense } from "react";
import { useRouter } from "@genuin/components/hooks/use-router";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

type StandardWallProps = {
  /**
   * Optional prop to specify the initial path for the Standard Wall component.
   */
  startingPath?: string; // Optional prop to specify the initial path
  defaultComponent?: React.ReactNode;
  baseLayoutVariant?: ComponentProps<typeof BaseLayout>["variant"];
} & ComponentProps<"div">;

const ProfileDetails = lazy(() =>
  import("../profile-details").then((m) => ({ default: m.ProfileDetails }))
);
const GroupDetailsPage = lazy(() =>
  import("../group-details/group-details").then((m) => ({
    default: m.GroupDetailsPage,
  }))
);
const CommunityDetails = lazy(() =>
  import("../community-details").then((m) => ({ default: m.CommunityDetails }))
);
const VideoPage = lazy(() =>
  import("../video").then((m) => ({ default: m.VideoPage }))
);
const SettingsPage = lazy(() =>
  import("@genuin/components/organisms/settings").then((m) => ({
    default: m.SettingsPage,
  }))
);
const Explore = lazy(() =>
  import("../explore").then((m) => ({ default: m.Explore }))
);
// const MyVideos = lazy(() => import("@genuin/components/organisms/my-videos"));
// const CreatePost = lazy(
//   () => import("@genuin/components/organisms/create-post")
// );

/**
 * Standard Wall component that serves as the main entry point for the application.
 * It sets up the routing for various pages such as home, latest, popular feeds, profile details, group details, community details, video page, and settings page.
 * It uses the `embedRouter` to handle routing and `BaseLayout` for consistent layout across the application.
 */
export function StandardWall({
  startingPath,
  defaultComponent,
  baseLayoutVariant,
  ...restProps
}: StandardWallProps) {
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
          <BaseLayout showToaster={false} variant={baseLayoutVariant}>
            <Route path={buildPageUrl({ type: "home" })}>
              <Feed feedType="HOME" />
            </Route>
            <Route path={buildPageUrl({ type: "latest" })}>
              <Feed feedType="LATEST" />
            </Route>
            <Route path={buildPageUrl({ type: "popular" })}>
              <Feed feedType="POPULAR" />
            </Route>
            <Route
              path={buildPageUrl({ type: "profile", asRoutePattern: true })}
            >
              {(params) => {
                return (
                  <Suspense fallback={null}>
                    <ProfileDetails
                      userName={(params as any).slug}
                      forBrand={false}
                    />
                  </Suspense>
                );
              }}
            </Route>
            <Route path={buildPageUrl({ type: "brand", asRoutePattern: true })}>
              {(params) => {
                return (
                  <Suspense fallback={null}>
                    <ProfileDetails
                      userName={(params as any).slug}
                      forBrand={true}
                    />
                  </Suspense>
                );
              }}
            </Route>
            <Route path={buildPageUrl({ type: "group", asRoutePattern: true })}>
              {(params) => {
                return (
                  <Suspense fallback={null}>
                    <GroupDetailsPage slug={(params as any).slug} />
                  </Suspense>
                );
              }}
            </Route>
            <Route
              path={buildPageUrl({ type: "community", asRoutePattern: true })}
            >
              {(params) => {
                return (
                  <Suspense fallback={null}>
                    <CommunityDetails slug={(params as any).slug} />
                  </Suspense>
                );
              }}
            </Route>
            <Route path={buildPageUrl({ type: "video", asRoutePattern: true })}>
              {(params) => {
                return (
                  <Suspense fallback={null}>
                    <VideoPage videoId={(params as any).slug} />
                  </Suspense>
                );
              }}
            </Route>
            <Route path={buildPageUrl({ type: "settings" })}>
              <Suspense fallback={null}>
                <SettingsPage />
              </Suspense>
            </Route>
            <Route path={buildPageUrl({ type: "explore" })}>
              <Suspense fallback={null}>
                <Explore />
              </Suspense>
            </Route>
            {/* <Route path={buildPageUrl({ type: "posts-create" })}>
              <Suspense fallback={null}>
                <CreatePost />
              </Suspense>
            </Route> */}
            {/* <Route path={buildPageUrl({ type: "posts" })}>
              <Suspense fallback={null}>
                <MyVideos />
              </Suspense>
            </Route> */}
            {/* <Route path={buildPageUrl({ type: "post", asRoutePattern: true })}>
              {(params) => {
                return (
                  <Suspense fallback={null}>
                    <CreatePost postId={(params as any).slug} />
                  </Suspense>
                );
              }}
            </Route> */}
            {/* <Route
              path={buildPageUrl({ type: "posts-draft", asRoutePattern: true })}
            >
              {(params) => {
                return (
                  <Suspense fallback={null}>
                    <CreatePost draftId={(params as any).slug} />
                  </Suspense>
                );
              }}
            </Route> */}
            <Route path="/default-comp">{defaultComponent}</Route>
            {/* <Route path={"/create-post"}>
              <Suspense fallback={null}>
                <CreatePost />
              </Suspense>
            </Route> */}
          </BaseLayout>
        </Router>
      </div>
    );
}
