import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { VideoTypes } from "@genuin/components/context";
import { FeedPlayer } from "@genuin/components/molecules/feed-player";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { HoverLinkCardList, type ContextualLinkMetaData } from "@genuin/components/organisms/hover-link-card-list";

import { EventSurface, EventSurfacePanel } from "./event-surface";
import { useEmit, useEventHistory, useLatestEvent, useSurfaceEvent } from "./event-surface-context";
import type { VideoContext } from "./event-surface.types";

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                    */
/* -------------------------------------------------------------------------- */

type DemoVideo = {
  video_id: string;
  community_id: string;
  group_id: string;
  source: string;
  poster: string;
  title: string;
};

const VIDEOS: DemoVideo[] = [
  {
    video_id: "video-1",
    community_id: "comm-1",
    group_id: "group-1",
    source: "https://vz-eee5e913-a30.b-cdn.net/0141acec-43c4-4247-9ff9-3938325aeae7/playlist.m3u8",
    poster:
      "https://thefoil.com/media/yFRhsJzpxkDunQ0T2uGeSr1J4pYf2zSVzmfOkawpU3o/resize:fill-down:460:240/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg",
    title: "SailGP and America's Cup: can they coexist?",
  },
  {
    video_id: "video-2",
    community_id: "comm-2",
    group_id: "group-2",
    source: "https://vz-eee5e913-a30.b-cdn.net/66005c38-4691-4b7c-be15-dc24544c145d/playlist.m3u8",
    poster:
      "https://thefoil.com/media/inir3oJzpxkDunQ0T2uGeSr1J4pYf2zSVzmfOkawpU3o/resize:fill-down:360:200/gravity:fp:0.3041738136:0.4733671339/quality:60/dpr:2/2026/05/e8tkvl1yBE4.jpg",
    title: "America's Cup is back",
  },
  {
    video_id: "video-3",
    community_id: "comm-3",
    group_id: "group-3",
    source: "https://vz-eee5e913-a30.b-cdn.net/63d1c2e2-40ac-4f79-9b07-0391a10b74f6/playlist.m3u8",
    poster:
      "https://thefoil.com/media/-UVLF5J_0v84UcmfLGv0eZxRdWjENlFHDGbr_OqpLww/resize:fill-down:360:200/gravity:fp:0.5:0.5/quality:60/dpr:2/2026/05/2zBK_WJOXyM.jpg",
    title: "Jet fighters dancing on water",
  },
  {
    video_id: "video-4",
    community_id: "comm-4",
    group_id: "group-4",
    source: "https://vz-eee5e913-a30.b-cdn.net/14c53e73-6f4e-4c63-b2f3-1f6eb1d0e4ff/playlist.m3u8",
    poster:
      "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
    title: "The technology behind modern foiling",
  },
];

const ARTICLES: ContextualLinkMetaData[] = VIDEOS.map((video, index) => ({
  id: `article-${index + 1}`,
  video_id: video.video_id,
  link: `https://example.com/articles/${index + 1}`,
  title: video.title,
  description: "Related reading, selected to match whichever video is currently running.",
  image: video.poster,
  brand: "The Foil",
  website: "thefoil.com",
}));

const toVideoContext = (video: DemoVideo, index: number): VideoContext => ({
  videoId: video.video_id,
  communityId: video.community_id,
  groupId: video.group_id,
  index,
});

/* -------------------------------------------------------------------------- */
/* Demo panels — each is deliberately tiny, to show how little a participant    */
/* needs: one hook to emit, one hook to read.                                   */
/* -------------------------------------------------------------------------- */

/** Emits `video:load` on mount and `video:change` whenever the selection moves. */
function MockVideoPanel() {
  const emit = useEmit();
  const [index, setIndex] = useState(0);
  const [previousVideoId, setPreviousVideoId] = useState<string | null>(null);

  useEffect(() => {
    emit("video:load", toVideoContext(VIDEOS[0]!, 0));
    // Mount-only: this models the first video becoming ready.
  }, [emit]);

  // Another panel asked for a video — follow it, but do NOT re-broadcast, or the
  // two panels would drive each other in a loop.
  useSurfaceEvent("item:select", (payload) => {
    const nextIndex = VIDEOS.findIndex((video) => video.video_id === payload.videoId);
    if (nextIndex < 0 || nextIndex === index) return;
    setPreviousVideoId(VIDEOS[index]!.video_id);
    setIndex(nextIndex);
  });

  const goTo = (nextIndex: number) => {
    if (nextIndex === index) return;
    const previous = VIDEOS[index]!.video_id;
    setPreviousVideoId(previous);
    setIndex(nextIndex);
    emit("video:change", { ...toVideoContext(VIDEOS[nextIndex]!, nextIndex), previousVideoId: previous });
  };

  const current = VIDEOS[index]!;

  return (
    <div className="gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:gap-3 gencl:rounded-xl gencl:bg-secondary-100 gencl:p-4">
      <p className="gencl:text-body-2-medium gencl:text-secondary-500">Video panel (emitter)</p>
      <img src={current.poster} alt="" className="gencl:h-40 gencl:w-full gencl:rounded-lg gencl:object-cover" />
      <p className="gencl:text-body-1-semi-bold">{current.title}</p>
      <dl className="gencl:grid gencl:grid-cols-3 gencl:gap-2 gencl:text-[11px] gencl:text-secondary-500">
        <div>
          <dt>video_id</dt>
          <dd className="gencl:text-secondary-900">{current.video_id}</dd>
        </div>
        <div>
          <dt>community_id</dt>
          <dd className="gencl:text-secondary-900">{current.community_id}</dd>
        </div>
        <div>
          <dt>group_id</dt>
          <dd className="gencl:text-secondary-900">{current.group_id}</dd>
        </div>
      </dl>
      {previousVideoId && <p className="gencl:text-[11px] gencl:text-secondary-500">came from {previousVideoId}</p>}
      <div className="gencl:mt-auto gencl:flex gencl:flex-wrap gencl:gap-2">
        {VIDEOS.map((video, videoIndex) => (
          <button
            key={video.video_id}
            type="button"
            data-testid={`play-${video.video_id}`}
            onClick={() => goTo(videoIndex)}
            className={
              videoIndex === index
                ? "gencl:rounded-full gencl:bg-primary gencl:px-3 gencl:py-1 gencl:text-[11px] gencl:text-white"
                : "gencl:rounded-full gencl:bg-white gencl:px-3 gencl:py-1 gencl:text-[11px]"
            }>
            {video.video_id}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Reads whichever video is running and emits `item:select` back on click. */
function MockArticlePanel({ label = "Article panel (listener + emitter)" }: { label?: string }) {
  const emit = useEmit();
  const loaded = useLatestEvent("video:load");
  const changed = useLatestEvent("video:change");
  // `video:change` supersedes `video:load` once the user moves; before that the
  // load latch is the only thing that has fired.
  const active = changed ?? loaded;

  const match = ARTICLES.find((article) => article.video_id === active?.videoId) ?? null;

  return (
    <div className="gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:gap-3 gencl:overflow-auto gencl:rounded-xl gencl:bg-white gencl:p-4">
      <p className="gencl:text-body-2-medium gencl:text-secondary-500">{label}</p>
      <p className="gencl:text-[11px] gencl:text-secondary-500">
        running video: <span className="gencl:text-secondary-900">{active?.videoId ?? "—"}</span>
      </p>
      {match ? (
        <div className="gencl:rounded-lg gencl:border gencl:border-primary gencl:p-3">
          <p className="gencl:text-body-2-semi-bold">{match.title}</p>
          <p className="gencl:text-[11px] gencl:text-secondary-500">matched on video_id</p>
        </div>
      ) : (
        <p className="gencl:text-[11px] gencl:text-secondary-500">no match yet</p>
      )}
      <div className="gencl:flex gencl:flex-col gencl:gap-2">
        {ARTICLES.map((article, index) => (
          <button
            key={article.id}
            type="button"
            data-testid={`select-${article.id}`}
            onClick={() =>
              emit("item:select", {
                itemId: article.id ?? article.link,
                index,
                videoId: article.video_id,
              })
            }
            className="gencl:rounded-lg gencl:bg-secondary-100 gencl:p-2 gencl:text-left gencl:text-[12px]">
            {article.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Passive observer — renders the capture queue, including each event's origin. */
function EventLogPanel() {
  const history = useEventHistory();

  return (
    <div className="gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:gap-2 gencl:overflow-auto gencl:rounded-xl gencl:bg-secondary-900 gencl:p-3 gencl:font-mono gencl:text-[11px] gencl:text-white">
      <p className="gencl:text-secondary-300">capture queue ({history.length})</p>
      {history.length === 0 && <p className="gencl:text-secondary-500">nothing captured yet</p>}
      {[...history].reverse().map((record) => (
        <div key={record.id} className="gencl:border-b gencl:border-secondary-700 gencl:pb-1">
          <span className="gencl:text-primary">#{record.id}</span> {record.type}{" "}
          <span className="gencl:text-secondary-400">from {record.sourceId}</span>
          <pre className="gencl:whitespace-pre-wrap gencl:text-secondary-300">{JSON.stringify(record.payload)}</pre>
        </div>
      ))}
    </div>
  );
}

/** One tile in the N-panel grid — every tile is both emitter and listener. */
function TilePanel({ video, index }: { video: DemoVideo; index: number }) {
  const emit = useEmit();
  // Both hooks must run unconditionally — `??` between two hook calls would
  // short-circuit the second one and break the rules of hooks.
  const changed = useLatestEvent("video:change");
  const loaded = useLatestEvent("video:load");
  const active = changed ?? loaded;
  const isActive = active?.videoId === video.video_id;

  return (
    <button
      type="button"
      onClick={() => emit("video:change", { ...toVideoContext(video, index), previousVideoId: null })}
      className={
        isActive
          ? "gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:gap-1 gencl:rounded-xl gencl:border-2 gencl:border-primary gencl:bg-white gencl:p-2 gencl:text-left"
          : "gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:gap-1 gencl:rounded-xl gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-2 gencl:text-left"
      }>
      <img src={video.poster} alt="" className="gencl:h-20 gencl:w-full gencl:rounded gencl:object-cover" />
      <span className="gencl:text-[11px] gencl:line-clamp-2">{video.title}</span>
      <span className="gencl:text-[10px] gencl:text-secondary-500">{video.video_id}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */

const meta: Meta<typeof EventSurface> = {
  title: "Organisms/EventSurface",
  component: EventSurface,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Event-driven container. Renders N arbitrary children on a flexible CSS grid and " +
          "gives them a shared, typed event bus with a capture queue. Children coordinate " +
          "without importing or knowing about each other: any panel emits, any panel listens. " +
          "Every emit is tagged with its origin panel and duplicate payloads are dropped, so " +
          "two panels can drive each other in both directions without looping.",
      },
    },
  },
  argTypes: {
    width: { control: "text", description: "Any CSS length; numbers are pixels." },
    height: { control: "text", description: "Any CSS length; numbers are pixels." },
    columns: { control: "text", description: "Track count (number) or raw template string." },
    rows: { control: "text" },
    gap: {
      control: "select",
      options: ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"],
    },
    queueCapacity: { control: "number" },
    suppressDuplicates: { control: "boolean" },
    onCapture: { action: "captured" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The core loop with no real video: a video panel broadcasts which clip is
 * running, an article panel matches against it. Neither imports the other.
 */
export const Playground: Story = {
  args: {
    width: "100%",
    height: 460,
    columns: "2fr 1fr",
    gap: "lg",
  },
  render: (args) => (
    <EventSurface {...args} ariaLabel="Event surface playground">
      <EventSurfacePanel id="video">
        <MockVideoPanel />
      </EventSurfacePanel>
      <EventSurfacePanel id="articles">
        <MockArticlePanel />
      </EventSurfacePanel>
    </EventSurface>
  ),
};

/**
 * N children on one bus. Click any tile: it broadcasts, every other tile matches
 * and highlights. Add or remove entries and nothing else changes — the surface
 * does not care how many participants there are.
 */
export const NPanelGrid: Story = {
  args: {
    width: "100%",
    height: "auto",
    columns: 3,
    gap: "md",
  },
  render: (args) => (
    <EventSurface {...args} ariaLabel="N panel grid">
      {[...VIDEOS, ...VIDEOS].map((video, index) => (
        <EventSurfacePanel key={`${video.video_id}-${index}`} id={`tile-${index}`}>
          <TilePanel video={video} index={index % VIDEOS.length} />
        </EventSurfacePanel>
      ))}
    </EventSurface>
  ),
};

/**
 * Named grid areas — a wide video pane, a sidebar, and a full-width log beneath.
 * Shows `areas` + per-panel `area`, and the live capture queue with origins.
 */
export const EventLog: Story = {
  args: {
    width: "100%",
    height: 640,
    columns: "2fr 1fr",
    rows: "1fr 200px",
    areas: '"video sidebar" "log log"',
    gap: "md",
  },
  render: (args) => (
    <EventSurface {...args} ariaLabel="Event surface with capture log">
      <EventSurfacePanel id="video" area="video">
        <MockVideoPanel />
      </EventSurfacePanel>
      <EventSurfacePanel id="articles" area="sidebar">
        <MockArticlePanel />
      </EventSurfacePanel>
      <EventSurfacePanel id="log" area="log">
        <EventLogPanel />
      </EventSurfacePanel>
    </EventSurface>
  ),
};

/** Mounts a listener only after events have already fired. */
function LateMountPanel() {
  const [mounted, setMounted] = useState(false);

  return (
    <div className="gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:gap-2">
      <button
        type="button"
        data-testid="mount-late-panel"
        onClick={() => setMounted((current) => !current)}
        className="gencl:rounded-full gencl:bg-primary gencl:px-3 gencl:py-1 gencl:text-[12px] gencl:text-white">
        {mounted ? "Unmount listener" : "Mount listener now"}
      </button>
      {mounted ? (
        <MockArticlePanel label="Late-mounted listener" />
      ) : (
        <p className="gencl:text-[11px] gencl:text-secondary-500">
          Switch videos first, then mount. The listener reads the running video from the queue latch immediately — it
          does not wait for the next change.
        </p>
      )}
    </div>
  );
}

/**
 * Why the queue exists. Change the video a few times, *then* mount the listener:
 * it shows the current video straight away rather than sitting blank until the
 * next emit.
 */
export const LateMount: Story = {
  args: {
    width: "100%",
    height: 460,
    columns: "2fr 1fr",
    gap: "lg",
  },
  render: (args) => (
    <EventSurface {...args} ariaLabel="Late mount replay">
      <EventSurfacePanel id="video">
        <MockVideoPanel />
      </EventSurfacePanel>
      <EventSurfacePanel id="late">
        <LateMountPanel />
      </EventSurfacePanel>
    </EventSurface>
  ),
};

/** Real `FeedPlayer` emitting into the bus; real `HoverLinkCardList` consuming it. */
function RealVideoPanel() {
  const emit = useEmit();
  const [index, setIndex] = useState(0);

  useSurfaceEvent("item:select", (payload) => {
    const nextIndex = VIDEOS.findIndex((video) => video.video_id === payload.videoId);
    if (nextIndex >= 0) setIndex(nextIndex);
  });

  const video = VIDEOS[index]!;

  useEffect(() => {
    emit("video:load", toVideoContext(video, index));
  }, [emit, video, index]);

  const advance = () => {
    const nextIndex = (index + 1) % VIDEOS.length;
    setIndex(nextIndex);
    emit("video:change", {
      ...toVideoContext(VIDEOS[nextIndex]!, nextIndex),
      previousVideoId: video.video_id,
    });
  };

  return (
    <PlayerProvider
      key={video.video_id}
      index={index}
      isActive
      videoId={video.video_id}
      videoUrl={video.source}
      videoDescription={video.title}
      totalVideos={VIDEOS.length}
      onPlayerIterationEnd={(move) => {
        if (move === false) return;
        advance();
      }}
      videoType={VideoTypes.Content}>
      <div className="gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:rounded-xl gencl:bg-black">
        <FeedPlayer
          key={video.video_id}
          src={video.source}
          videoId={video.video_id}
          poster={video.poster}
          playsInline
          isActive
          videoDescription={video.title}
          videoType={VideoTypes.Content}
          sponsorshipInfo={null}
          className="gencl:h-full! gencl:w-full! gencl:object-cover"
          onEnded={advance}
        />
      </div>
    </PlayerProvider>
  );
}

function RealArticlePanel() {
  const emit = useEmit();
  const changed = useLatestEvent("video:change");
  const loaded = useLatestEvent("video:load");
  const active = changed ?? loaded;

  return (
    <HoverLinkCardList
      className="gencl:size-full"
      items={ARTICLES}
      width="100%"
      height="100%"
      activeVideoId={active?.videoId ?? null}
      pinActiveItemToTop
      autoRotate={false}
      ctaText="Read More"
      ariaLabel="Articles related to the active video"
      onLinkClick={(item, index) =>
        emit("item:select", {
          itemId: item.id ?? item.link,
          index,
          videoId: item.video_id,
        })
      }
    />
  );
}

/**
 * The production pairing: a real `FeedPlayer` and a real `HoverLinkCardList`,
 * wired together only through the bus. Playing a video re-pins the matching
 * article; clicking an article switches the video. No props between them.
 */
export const VideoArticleSync: Story = {
  args: {
    width: "100%",
    height: 440,
    columns: "688px minmax(0, 1fr)",
    gap: "lg",
  },
  render: (args) => (
    <EventSurface {...args} ariaLabel="Video and article two-way sync">
      <EventSurfacePanel id="video">
        <RealVideoPanel />
      </EventSurfacePanel>
      <EventSurfacePanel id="articles" className="gencl:rounded-xl gencl:bg-white gencl:p-2">
        <RealArticlePanel />
      </EventSurfacePanel>
    </EventSurface>
  ),
};
