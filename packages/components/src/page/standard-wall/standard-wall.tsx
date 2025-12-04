import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { BaseLayout } from "@genuin/components/templates/base-layout";
import { Feed } from "@genuin/components/templates/feed";
import { Route, Router } from "wouter";
import { ProfileDetails } from "../profile-details";
import { GroupDetailsPage } from "../group-details/group-details";
import { CommunityDetails } from "../community-details";
import { VideoPage } from "../video";
import { SettingsPage } from "@genuin/components/organisms/settings";
import { Explore } from "../explore";
import { ComponentProps, useInsertionEffect, useState } from "react";
import { useRouter } from "@genuin/components/hooks/use-router";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

import { MyVideos } from "@genuin/components/organisms/my-videos";
import { CreatePost } from "@genuin/components/organisms/create-post";

type StandardWallProps = {
  /**
   * Optional prop to specify the initial path for the Standard Wall component.
   */
  startingPath?: string; // Optional prop to specify the initial path
  defaultComponent?: React.ReactNode;
  baseLayoutVariant?: ComponentProps<typeof BaseLayout>["variant"];
} & ComponentProps<"div">;

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

  useInsertionEffect(() => {
    if (defaultComponent) {
      router?.replace("/default-comp");
    }
    setShouldRender(true);
  }, []);

  if (shouldRender)
    return (
      <div className="gencl:w-full gencl:h-full gencl:relative" {...restProps}>
        <Router hook={embedRouter?.hook}>
          <BaseLayout variant={baseLayoutVariant}>
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
                  <ProfileDetails
                    userName={(params as any).slug}
                    forBrand={false}
                  />
                );
              }}
            </Route>
            <Route path={buildPageUrl({ type: "brand", asRoutePattern: true })}>
              {(params) => {
                return (
                  <ProfileDetails
                    userName={(params as any).slug}
                    forBrand={true}
                  />
                );
              }}
            </Route>
            <Route path={buildPageUrl({ type: "group", asRoutePattern: true })}>
              {(params) => {
                return <GroupDetailsPage slug={(params as any).slug} />;
              }}
            </Route>
            <Route
              path={buildPageUrl({ type: "community", asRoutePattern: true })}
            >
              {(params) => {
                return <CommunityDetails slug={(params as any).slug} />;
              }}
            </Route>
            <Route path={buildPageUrl({ type: "video", asRoutePattern: true })}>
              {(params) => {
                return <VideoPage videoId={(params as any).slug} />;
              }}
            </Route>
            <Route path={buildPageUrl({ type: "settings" })}>
              <SettingsPage />
            </Route>
            <Route path={buildPageUrl({ type: "explore" })}>
              <Explore />
            </Route>
            <Route path={buildPageUrl({ type: "posts-create" })}>
              <CreatePost />
            </Route>
            <Route path={buildPageUrl({ type: "posts" })}>
              <MyVideos />
            </Route>
            <Route path={buildPageUrl({ type: "post", asRoutePattern: true })}>
              {(params) => {
                return <CreatePost postId={(params as any).slug} />;
              }}
            </Route>
            <Route
              path={buildPageUrl({ type: "posts-draft", asRoutePattern: true })}
            >
              {(params) => {
                return <CreatePost draftId={(params as any).slug} />;
              }}
            </Route>
            <Route path="/default-comp">{defaultComponent}</Route>
          </BaseLayout>
        </Router>
      </div>
    );
}
