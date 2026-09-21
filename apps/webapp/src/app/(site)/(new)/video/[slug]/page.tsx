import { VideoPage } from "@genuin/components/page/video";
import { createEmptyFeedPage } from "@genuin/components/react-query/api/feed";
import { parseFeed } from "@genuin/components/react-query/api/feed/parser";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { makeServerQueryClient } from "@genuin/components/react-query/server-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { getOgUrl } from "@/lib/utils";
import { VideoLinks } from "@components/common/video-links";
import { fetchMetadata } from "@lib/api/meta-data";
import { buildVideoJsonLd, getVideoFeedResponse, getVideoSeoData, toTitle } from "@lib/api/video-seo";
import { PATH_NAME } from "@lib/utils/constants/path";

import { VideoSeoBlock } from "./video-seo-block";

/**
 * Options bag that identifies the video feed's cache entry. Must byte-match
 * (after key-relevant filtering) what `VideoPage` passes to
 * `useFeed("VIDEO", ...)` (`packages/components/src/page/video/video.tsx`) —
 * same keys, same order — or the seeded query silently fails to hydrate and
 * the client refetches.
 */
function getVideoFeedOptions(slug: string) {
  return { isSingleVideo: true, isInIframe: false, startVideoSlug: slug };
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    community: string;
    group: string;
    utm_source: string;
    share_image_id?: number;
  }>;
};

export default async function Component(props: PageProps) {
  const params = await props.params;

  // Request-scoped fetch is deduped with generateMetadata via React cache().
  const seoData = await getVideoSeoData(params.slug);
  const jsonLd = seoData ? buildVideoJsonLd(seoData) : null;

  // Same React cache()'d call getVideoSeoData already made above — this is a
  // cache hit, not a second upstream request. Seeds the client's useFeed
  // cache with the feed the server already fetched, so <VideoPage> adopts it
  // instead of re-fetching /goservices/feed/video on mount.
  const feedResponse = await getVideoFeedResponse(params.slug);
  const rawFeeds = feedResponse?.feeds ?? [];

  // Fail open: an empty/missing feed response means there's nothing useful to
  // seed. Skip hydration entirely rather than risk seeding a bad shape — the
  // client hook falls back to its normal fetch, exactly like today.
  let hydratedState: ReturnType<typeof dehydrate> | undefined;
  if (rawFeeds.length > 0) {
    // Mirror the client's fetchVideoDetails filter exactly (keeps ads items,
    // drops only the middleware "all_caught_up" marker) so the seeded page is
    // structurally identical to what the client would have produced.
    const filteredFeeds = rawFeeds.filter((item) => item.type !== "all_caught_up");
    const page1 = {
      ...createEmptyFeedPage(),
      feed: parseFeed(filteredFeeds, false),
    };

    const qc = makeServerQueryClient();
    qc.setQueryData(getQueryKeyForFeed("VIDEO", getVideoFeedOptions(params.slug)), {
      pages: [page1],
      pageParams: [undefined],
    });
    hydratedState = dehydrate(qc);
  }

  const videoPage = <VideoPage videoId={params.slug} />;

  return (
    <>
      {jsonLd ? (
        // Server-rendered so crawlers and AI engines see VideoObject in the initial HTML.
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      {seoData ? <VideoSeoBlock data={seoData} /> : null}
      {/* Streamed via Suspense — the related-feed fetch stays off the critical path.
          afterVideoId seeds pagination from the current video so each page links to
          the videos after it — coverage chains instead of repeating page 1. */}
      {seoData ? (
        <VideoLinks
          currentSlug={seoData.slug}
          loopSlug={seoData.loop?.slug}
          communitySlug={seoData.community?.slug}
          afterVideoId={seoData.videoId}
        />
      ) : null}
      {hydratedState ? <HydrationBoundary state={hydratedState}>{videoPage}</HydrationBoundary> : videoPage}
    </>
  );
}

type VideoDataType = {
  title: string;
  description: string;
  preview_image: string;
  domain?: string;
  subdomain?: string;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Both fetches are request-scoped; getVideoSeoData is deduped with the page
  // component via React cache(). meta_data drives title/description/OG image
  // (share_image_id selects a share-specific dynamic image); the feed fetch
  // supplies the real mp4, duration, dimensions and counts.
  const [videoDetails, seoData] = await Promise.all([
    fetchMetadata({ type: 4, slug: params.slug, shareImageId: searchParams.share_image_id }) as Promise<VideoDataType>,
    getVideoSeoData(params.slug),
  ]);
  if (videoDetails && Object.keys(videoDetails).length === 0) {
    return notFound();
  }

  // Canonical / og:url are always param-free and self-referencing per host
  // (tracking params survive only for click-time analytics, never in indexable
  // URLs). Prefer the canonical computed alongside the feed fetch; fall back to
  // the meta_data host config when the feed fetch returned nothing.
  const canonicalUrl =
    seoData?.canonicalUrl ?? getOgUrl(PATH_NAME.video(params.slug), videoDetails?.domain, videoDetails?.subdomain);

  // Ensure image URL is absolute for better SEO
  const imageUrl = videoDetails?.preview_image?.startsWith("http")
    ? videoDetails.preview_image
    : `${process.env.NEXT_PUBLIC_HOST_URL?.trim() || "https://begenuin.com"}${videoDetails?.preview_image}`;

  // Prefer the concise, feed-derived title (seoData) over meta_data's raw title,
  // which is the full caption; derive a headline from it as a last resort.
  const title = seoData?.title || toTitle(videoDetails?.title) || "Short Video | Genuin";
  // Prefer the real caption over meta_data's generic "Watch videos on Genuin".
  const description =
    seoData?.description ||
    videoDetails?.description ||
    "Watch this short video on Genuin - your destination for engaging short-form video content";

  // Only emit video-player unfurl tags when we have a real media file. A player
  // card requires fixed-pixel dimensions and a playable media URL — falling back
  // to summary_large_image is valid, an aspect-ratio-as-pixels player card is not.
  const hasMedia = !!seoData?.contentUrl;
  const videoTags: Record<string, string> = {};
  if (hasMedia && seoData) {
    videoTags["og:video"] = seoData.contentUrl!;
    videoTags["og:video:secure_url"] = seoData.contentUrl!;
    videoTags["og:video:type"] = "video/mp4";
    if (seoData.width && seoData.height) {
      videoTags["og:video:width"] = String(seoData.width);
      videoTags["og:video:height"] = String(seoData.height);
      videoTags["twitter:player:width"] = String(seoData.width);
      videoTags["twitter:player:height"] = String(seoData.height);
    }
    videoTags["twitter:card"] = "player";
    videoTags["twitter:player"] = canonicalUrl;
  }

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL?.trim() || "https://begenuin.com"),
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "video.other",
      images: [{ url: imageUrl, width: 1084, height: 546 }],
      ...(hasMedia && seoData?.contentUrl
        ? {
            videos: [
              {
                url: seoData.contentUrl,
                secureUrl: seoData.contentUrl,
                type: "video/mp4",
                ...(seoData.width && seoData.height ? { width: seoData.width, height: seoData.height } : {}),
              },
            ],
          }
        : {}),
      siteName: "Genuin",
    },
    other: {
      "twitter:image": imageUrl,
      ...(hasMedia ? {} : { "twitter:card": "summary_large_image" }),
      ...videoTags,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  };
}

// Force dynamic rendering for up-to-date content
export const dynamic = "force-dynamic";
export const revalidate = 0;
