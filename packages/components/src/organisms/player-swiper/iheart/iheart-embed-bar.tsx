"use client";
import { useState } from "react";
import { Skeleton } from "@genuin/ui/components/skeleton/skeleton";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

const IFRAME_HEIGHT = 50;

function buildIheartSrc(
  attributes: NonNullable<NonNullable<PostDetailsType["video"]>["attributes"]>,
): string | null {
  if (attributes.type === "station" && attributes.station_id) {
    return `https://www.iheart.com/live/${attributes.station_id}/?embed=true`;
  }
  if (attributes.type === "podcast" && attributes.podcast_id) {
    return `https://www.iheart.com/podcast/${attributes.podcast_id}/?embed=true`;
  }
  return null;
}

type IHeartEmbedBarProps = {
  /** Video attributes containing type, station_id, podcast_id */
  attributes: NonNullable<PostDetailsType["video"]>["attributes"];
};

/**
 * Renders a 50px iHeart embed iframe below the video player with a shimmer
 * skeleton shown until the iframe content is loaded.
 *
 * Only renders when a valid src can be derived from the given attributes.
 */
export function IHeartEmbedBar({ attributes }: IHeartEmbedBarProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!attributes) return null;

  const src = buildIheartSrc(attributes);
  if (!src) return null;

  return (
    <div
      className="gencl:relative gencl:w-full gencl:shrink-0 gencl:border-t gencl:border-secondary-150 gencl:transition-all gencl:duration-300 gencl:ease-in-out"
      style={{ height: IFRAME_HEIGHT }}
    >
      {!isLoaded && (
        <Skeleton className="gencl:absolute gencl:inset-0 gencl:rounded-none" />
      )}
      <iframe
        width="100%"
        height={IFRAME_HEIGHT}
        src={src}
        style={{ border: "none" }}
        title="iHeart Radio"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

export { IFRAME_HEIGHT };
