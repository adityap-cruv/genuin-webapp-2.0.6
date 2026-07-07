import { VideoPage } from "@genuin/components/page/video";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { getOgUrl } from "@/lib/utils";
import { fetchMetadata } from "@lib/api/meta-data";
import { buildVideoJsonLd, getVideoSeoData } from "@lib/api/video-seo";
import { PATH_NAME } from "@lib/utils/constants/path";

import { VideoSeoBlock } from "./video-seo-block";

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

  return (
    <>
      {jsonLd ? (
        // Server-rendered so crawlers and AI engines see VideoObject in the initial HTML.
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      {seoData ? <VideoSeoBlock data={seoData} /> : null}
      <VideoPage videoId={params.slug} />
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
    : `${process.env.NEXT_PUBLIC_HOST_URL}${videoDetails?.preview_image}`;

  const title = videoDetails?.title || seoData?.title || "Short Video | Genuin";
  const description =
    videoDetails?.description ||
    seoData?.description ||
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
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL || "https://begenuin.com"),
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
