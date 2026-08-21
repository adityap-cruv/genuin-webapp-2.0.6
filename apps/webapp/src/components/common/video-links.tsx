import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";

import { getRelatedVideos, type RelatedInput } from "@lib/api/related-videos";
import { PATH_NAME } from "@lib/utils/constants/path";

/**
 * Server-rendered internal links to sibling/child videos, shared by the video,
 * community, and group routes. Turns each page into a crawl hub so Googlebot can
 * walk to the videos beneath it — the client feed is a crawl dead-end, so without
 * these most sitemap URLs stay "unknown to Google" (discovered, never crawled).
 *
 * Streamed behind `<Suspense>`: the feed fetch runs off the critical path, so it
 * never delays the page shell (no TTFB/LCP cost). Rendered `sr-only` — its job is
 * crawl reachability, not UI; the client player/feed owns the on-screen
 * experience, and the text mirrors real content (no cloaking). Relative hrefs
 * (`/video/[slug]`) resolve to the current host, keeping links within the right
 * brand on whitelabel subdomains.
 */
async function VideoLinksList(props: RelatedInput) {
  const videos = await getRelatedVideos(props);
  if (!videos.length) return null;

  return (
    <nav className="sr-only" aria-label="More videos" data-seo-related>
      <h2>More videos</h2>
      <ul>
        {videos.map((video) => (
          <li key={video.slug}>
            <a href={PATH_NAME.video(video.slug)}>{video.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function VideoLinks(props: RelatedInput) {
  // Non-critical SEO block: silent on both load and chunk-load failure — it must
  // never surface a spinner or an error card over the page.
  return (
    <SafeSuspense fallback={null} errorFallback={null}>
      <VideoLinksList {...props} />
    </SafeSuspense>
  );
}
