/**
 * Presentation component for a single reel video player.
 *
 * Renders only the `<video>` element; all playback logic lives in
 * `usePlayerLifecycle` and its sub-hooks. This component is intentionally
 * kept slim (≤120 lines) so it is easy to reason about in isolation.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { VideoScrubber } from "@cxr/player/VideoScrubber";
import { useActiveVideoIdBroadcast } from "@cxr/player/playerEvents";
import type { LightPlayerProps } from "@cxr/player/types";
import { usePlayerLifecycle } from "@cxr/player/usePlayerLifecycle";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";

/**
 * A `<video>` element wired up to the full CXR player pipeline.
 *
 * All behaviour (HLS, IMA ads, analytics) is driven by props — the parent
 * (ReelItem) owns state and passes `isPlay`, `isMuted`, `lastUserPlayAt` etc.
 *
 * @example
 * <LightPlayer
 *   content={item.content}
 *   id={item.id}
 *   isPlay={isPlay}
 *   isMuted={isMuted}
 *   tagDetails={tagDetails}
 *   videoDetails={item}
 * />
 */
export function LightPlayer({
  content,
  ad,
  id,
  poster,
  videoId,
  config,
  videoMode,
  isMuted,
  volume,
  isPlay,
  hideScrubber,
  supportAds,
  tagDetails,
  videoDetails,
  dims,
  lastUserPlayAt = 0,
  onTimeUpdate,
  onEnded,
  onReady,
}: LightPlayerProps): React.JSX.Element {
  const videoEl = useRef<HTMLVideoElement>(null);
  const lastUserPlayAtRef = useRef<number>(lastUserPlayAt);
  const [progress, setProgress] = useState(0);

  // Keep the ref in sync when the prop changes (avoids stale closure in lifecycle hooks).
  lastUserPlayAtRef.current = lastUserPlayAt;

  // Apply the volume (0..1) to the native element. usePlayerLifecycle also applies
  // it once the player is ready; this covers the pre-ready window.
  useEffect(() => {
    if (videoEl.current) {
      videoEl.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  const { sendEvent } = useAnalytics();
  const { setVolume } = usePlayer();

  // Broadcast active videoId to window for external consumers.
  useActiveVideoIdBroadcast({ videoId });

  // Ref that usePlayerLifecycle can set to true before programmatic volume/mute
  // changes so the volumechange listener below ignores those events and only
  // reacts to external changes (hardware volume buttons, OS media controls).
  const suppressVolumeChangeRef = useRef(false);

  // Sync mute icon with the video element's actual muted/volume state.
  // Fires when the user changes hardware volume (iOS/Android route OS volume
  // through the video element) or when video.muted changes externally.
  useEffect(() => {
    const video = videoEl.current;
    if (!video) return;
    const handleVolumeChange = (): void => {
      if (suppressVolumeChangeRef.current) return;
      // Sync the provider to the element's actual level (hardware buttons / OS
      // media controls route through here). muted → treat as 0.
      setVolume(video.muted ? 0 : video.volume);
    };
    video.addEventListener("volumechange", handleVolumeChange);
    return () => video.removeEventListener("volumechange", handleVolumeChange);
  }, [videoEl, setVolume]);

  // Determine whether this item is a "video" item for analytics + auto-advance.
  // NormalisedReel uses `kind` ("video" | "video-with-ad") and camelCase
  // `videoType`; legacy raw reels use `type` / snake_case `video_type`. Organic
  // reels often have a null video_type, so the `kind` check is what lets them
  // auto-advance on completion — not just vast/typed items.
  const rawKind = videoDetails["kind"];
  const rawVideoType = videoDetails["video_type"] ?? videoDetails["videoType"];
  const isVideoItem =
    videoDetails["type"] === "video" ||
    rawKind === "video" ||
    rawKind === "video-with-ad" ||
    (typeof rawVideoType === "string" && rawVideoType !== "");
  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number, itemId: number) => {
      if (duration > 0) setProgress(currentTime / duration);
      onTimeUpdate?.(currentTime, duration, itemId);
    },
    [onTimeUpdate]
  );

  usePlayerLifecycle({
    videoEl,
    content,
    ad,
    config,
    isPlay,
    isMuted,
    volume,
    tagDetails,
    videoDetails,
    dims,
    supportAds,
    sendEvent,
    suppressVolumeChangeRef,
    getLastUserPlayAt: () => lastUserPlayAtRef.current,
    onTimeUpdate: handleTimeUpdate,
    onEnded,
    onReady,
    itemId: id,
    isVideoItem,
  });

  return (
    <div className="lightPlayer gencl:relative gencl:h-full gencl:w-full">
      <video
        poster={poster}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy attribute value from original JSX
        crossOrigin={"true" as any}
        ref={videoEl}
        className="gencl:h-full gencl:w-full"
        style={{ objectFit: videoMode ?? "contain" }}
        preload="metadata"
        muted
        playsInline
        data-testid="light-player-video"
      />
      {!hideScrubber && <VideoScrubber progress={progress} />}
    </div>
  );
}
