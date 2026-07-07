import type { VideoSeoData } from "@lib/api/video-seo";

/**
 * Server-rendered SEO/GEO text block for the (otherwise client-rendered) video
 * page. Emits crawlable body text — an `<h1>`, description, author link, and
 * engagement counts — into the initial HTML so crawlers and AI engines have
 * something citable, and so the page ships exactly one `<h1>`.
 *
 * Rendered `sr-only`: present in the DOM and read by crawlers/screen readers,
 * visually deferred to the client player that hydrates on top. The text mirrors
 * what the client UI shows the user (no cloaking).
 */
export function VideoSeoBlock({ data }: { data: VideoSeoData }) {
  const title = data.title?.trim();
  if (!title) return null;

  const description = data.description?.trim();
  const hasDistinctDescription = !!description && description !== title;
  const views = typeof data.viewCount === "number" ? data.viewCount.toLocaleString("en-US") : null;
  const likes = typeof data.likeCount === "number" ? data.likeCount.toLocaleString("en-US") : null;
  const publishedLabel = data.uploadDate
    ? new Date(data.uploadDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <section className="sr-only" data-seo-block>
      <h1>{title}</h1>
      {hasDistinctDescription ? <p>{description}</p> : null}
      {data.author?.name ? (
        <p>
          By{" "}
          {data.author.url ? <a href={data.author.url}>{data.author.name}</a> : <span>{data.author.name}</span>}
        </p>
      ) : null}
      {publishedLabel && data.uploadDate ? (
        <p>
          Published <time dateTime={data.uploadDate}>{publishedLabel}</time>
        </p>
      ) : null}
      {data.community?.name ? (
        <p>
          From the{" "}
          {data.community.url ? (
            <a href={data.community.url}>{data.community.name}</a>
          ) : (
            <span>{data.community.name}</span>
          )}{" "}
          community{data.community.description ? `. ${data.community.description}` : ""}
        </p>
      ) : null}
      {data.loop?.name ? (
        <p>
          Posted in{" "}
          {data.loop.url ? <a href={data.loop.url}>{data.loop.name}</a> : <span>{data.loop.name}</span>}
          {data.loop.description ? `. ${data.loop.description}` : ""}
        </p>
      ) : null}
      {views ? <p>{views} views</p> : null}
      {likes ? <p>{likes} likes</p> : null}
    </section>
  );
}
