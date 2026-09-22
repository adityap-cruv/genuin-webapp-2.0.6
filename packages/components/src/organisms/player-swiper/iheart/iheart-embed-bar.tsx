"use client";
import { Skeleton } from "@genuin/ui/components/skeleton/skeleton";
import { useEffect, useRef, useState } from "react";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

const IFRAME_HEIGHT = 50;
const PLAYERJS_SRC = "https://cdn.embed.ly/player-0.1.0.min.js";

type PlayerJsInstance = {
  on: (event: string, callback: (payload?: unknown) => void) => void;
  ready: (payload?: unknown) => void;
  play: () => void;
  pause: () => void;
};

type PlayerJsWindow = Window & {
  playerjs?: {
    Player: new (iframe: HTMLIFrameElement, options?: { autoplay?: number }) => PlayerJsInstance;
  };
};

let playerJsPromise: Promise<void> | null = null;

function loadPlayerJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as PlayerJsWindow).playerjs?.Player) return Promise.resolve();
  if (playerJsPromise) return playerJsPromise;

  playerJsPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLAYERJS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Player.js failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = PLAYERJS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Player.js failed to load"));
    document.body.appendChild(script);
  }).catch((error: unknown) => {
    playerJsPromise = null;
    throw error;
  });

  return playerJsPromise;
}

function buildIheartSrc(
  attributes: NonNullable<NonNullable<PostDetailsType["video"]>["attributes"]>,
  autoPlay: boolean
): string | null {
  const embedQuery = autoPlay ? "?embed=true&autoplay=1" : "?embed=true";
  if (attributes.type === "station" && attributes.station_id) {
    return `https://www.iheart.com/live/${attributes.station_id}/${embedQuery}`;
  }
  if (attributes.type === "podcast" && attributes.podcast_id) {
    return `https://www.iheart.com/podcast/${attributes.podcast_id}/${embedQuery}`;
  }
  return null;
}

type IHeartEmbedBarProps = {
  /** Video attributes containing type, station_id, podcast_id */
  attributes: NonNullable<PostDetailsType["video"]>["attributes"];
  /** Requests playback when the iframe is mounted after a user interaction. */
  autoPlay?: boolean;
};

/**
 * Renders a 50px iHeart embed iframe below the video player with a shimmer
 * skeleton shown until the iframe content is loaded.
 *
 * Only renders when a valid src can be derived from the given attributes.
 */
export function IHeartEmbedBar({ attributes, autoPlay = false }: IHeartEmbedBarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const src = attributes ? buildIheartSrc(attributes, autoPlay) : null;

  useEffect(() => {
    if (!autoPlay || !src || !iframeRef.current) return;
    const iframe = iframeRef.current;

    let disposed = false;
    let player: PlayerJsInstance | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    void loadPlayerJs()
      .then(() => {
        if (disposed) return;

        const Player = (window as PlayerJsWindow).playerjs?.Player;
        if (!Player) throw new Error("Player.js did not expose its Player API");

        player = new Player(iframe, { autoplay: 1 });
        player.on("ready", (payload) => {
          if (disposed || !player) return;
          player.ready(payload);
          player.play();

          let attempts = 1;
          const retryPlay = () => {
            if (disposed || attempts >= 5) return;
            attempts += 1;
            player?.play();
            retryTimer = setTimeout(retryPlay, 2000);
          };
          retryTimer = setTimeout(retryPlay, 2000);
        });
      })
      .catch((error: unknown) => {
        if (!disposed) console.error("Unable to start the iHeart player", error);
      });

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (!player || !iframe.contentWindow) return;
      try {
        player.pause();
      } catch {
        // Player.js can outlive the iframe by one render during unmount.
      }
    };
  }, [autoPlay, src]);

  if (!src) return null;

  return (
    <div
      className="gencl:relative gencl:w-full gencl:shrink-0 gencl:border-secondary-150 gencl:transition-all gencl:duration-300 gencl:ease-in-out"
      style={{ height: IFRAME_HEIGHT }}>
      {!isLoaded && <Skeleton className="gencl:absolute gencl:inset-0 gencl:rounded-none" />}
      <iframe
        width="100%"
        height={IFRAME_HEIGHT}
        src={src}
        ref={iframeRef}
        style={{ border: "none" }}
        title="iHeart Radio"
        allow="autoplay"
        onLoad={() => {
          setIsLoaded(true);
        }}
      />
    </div>
  );
}

export { IFRAME_HEIGHT };
