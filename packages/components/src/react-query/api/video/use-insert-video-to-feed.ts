import { useMutation } from "@tanstack/react-query";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";

import { queryClient } from "@genuin/components/react-query/client";

import type { FeedPage } from "../feed/feed";

import { fetchVideoDetails } from "./video";

type BrandContext =
  | {
      id?: string;
      type: string;
      value?: string;
    }[]
  | undefined;

type InsertVideoParams = {
  slug: string;
  targetIndex: number;
  embedId?: string;
  placementId?: string;
  shouldShowMiddlewareOverlay?: boolean;
  brandContext?: BrandContext;
};

type InsertVideoResult = {
  didInsert: boolean;
  targetIndex: number;
};

/**
 * Inserts a fetched video into the InfiniteData<FeedPage> cache at the given targetIndex.
 * Guards against duplicate insertions within each page.
 */
function insertVideoIntoCache(
  queryKey: QueryKey,
  slug: string,
  targetIndex: number,
  videoToInsert: FeedPage["feed"][number]
): boolean {
  let didInsert = false;

  queryClient.setQueryData<InfiniteData<FeedPage>>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    let remainingIndex = Math.max(targetIndex, 0);

    const updatedPages = oldData.pages.map((page) => {
      const feed = [...page.feed];
      let insertedOnThisPage = false;

      if (!didInsert) {
        if (remainingIndex <= feed.length) {
          const alreadyExists = feed.some((item) => item.video?.slug === slug || item.video?.id === slug);

          if (!alreadyExists) {
            feed.splice(remainingIndex, 0, videoToInsert);
            insertedOnThisPage = true;
            didInsert = true;
          }
        }
        remainingIndex = Math.max(remainingIndex - feed.length, 0);
      }

      return {
        ...page,
        feed,
        totalVideos:
          typeof page.totalVideos === "number" ? page.totalVideos + (insertedOnThisPage ? 1 : 0) : page.totalVideos,
      };
    });

    if (!didInsert && updatedPages.length > 0) {
      const lastPageIndex = updatedPages.length - 1;
      const lastPage = updatedPages[lastPageIndex];

      if (lastPage) {
        const alreadyExists = lastPage.feed.some((item) => item.video?.slug === slug || item.video?.id === slug);

        if (!alreadyExists) {
          updatedPages[lastPageIndex] = {
            ...lastPage,
            feed: [...lastPage.feed, videoToInsert],
            totalVideos: typeof lastPage.totalVideos === "number" ? lastPage.totalVideos + 1 : lastPage.totalVideos,
          } as FeedPage;
          didInsert = true;
        }
      }
    }

    return { ...oldData, pages: updatedPages };
  });

  return didInsert;
}

/**
 * Mutation hook that fetches a video by slug and inserts it into the infinite feed cache
 * at the specified targetIndex. Returns whether the insert actually occurred.
 */
export function useInsertVideoToFeed(queryKey: QueryKey) {
  return useMutation<InsertVideoResult, Error, InsertVideoParams>({
    mutationFn: async ({ slug, targetIndex, embedId, placementId, shouldShowMiddlewareOverlay, brandContext }) => {
      const videoDetails = await fetchVideoDetails(
        slug,
        embedId,
        placementId,
        shouldShowMiddlewareOverlay,
        brandContext
      );

      if (!videoDetails || videoDetails.length === 0) {
        return { didInsert: false, targetIndex };
      }

      const videoToInsert = videoDetails[0];

      if (!videoToInsert) {
        return { didInsert: false, targetIndex };
      }

      const didInsert = insertVideoIntoCache(queryKey, slug, targetIndex, videoToInsert);

      return { didInsert, targetIndex };
    },
  });
}
