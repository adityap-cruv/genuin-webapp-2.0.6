/**
 * Unit tests for the Genuin -> iHeart payload builders.
 *
 * NOTE: web-sdk has no unit-test runner yet (Vitest dep requires team approval). Authored
 * for Vitest; documents the per-event payload shape from Highlights_AnalyticsSpec.
 */

import { describe, expect, it } from "vitest";

import {
  buildPause,
  buildPlay,
  buildScreenView,
  buildShare,
  buildStreamEnd,
  buildStreamStart,
  buildTrackEnd,
} from "./iheart-event-map";
import type { SessionSnapshot } from "./iheart-session";

const snapshot: SessionSnapshot = {
  sessionId: "sess-1",
  subSessionId: "subsess-1",
  streamIsMute: false,
  streamFeedPosition: 5,
  streamFeedTotal: 20,
  listenTime: 42,
  startPosition: 12,
  playbackStartTime: 1_700_000_000_000,
  streamInitTime: 1_700_000_000_000,
  isActive: true,
  currentClipId: "25100459",
  isTrackOpen: true,
};

const samplePayload = {
  content_id: "25100459", // clip id -> station.asset.id
  title: "Knicks parade clip", // clip caption -> station.asset.name
  podcast_id: "POD-100",
  station_id: "1469", // -> station.asset.sub.id = live|1469
  section_title: "Z100", // parent station name -> station.asset.sub.name
  section_subtitle: "Espresso",
  section_id: "sec-42",
  autoplay: true,
  url: "https://z100.iheart.com/content/abc",
};

describe("iHeart payload builders", () => {
  it("buildStreamStart -> stream_start with shared identity + NEW trio", () => {
    const event = buildStreamStart(samplePayload, snapshot);
    expect(event.type).toBe("stream_start");
    expect(event.data.station?.asset?.id).toBe("25100459");
    expect(event.data.station?.asset?.sub?.id).toBe("live|1469");
    expect(event.data.station?.asset?.sub?.name).toBe("Z100");
    expect(event.data.station?.asset?.type).toBe("highlights");
    expect(event.data.station?.sessionId).toBe("sess-1");
    expect(event.data.streamFeedPosition).toBe(5);
    expect(event.data.streamFeedTotal).toBe(20);
    expect(event.data.isAutoplay).toBe(true);
    expect(event.data.station?.asset?.name).toBe("Knicks parade clip");
    expect(event.data.station?.playbackStartTime).toBe(1_700_000_000_000);
    expect(event.data.station?.playedFrom).toBe(431);
  });

  it("resolves asset fields nested inside a video object", () => {
    const nested = {
      autoplay: true,
      video: { video_id: "CLIP-9", title: "Nested caption", station_id: "77", section_title: "Show X" },
    };
    const event = buildStreamStart(nested, snapshot);
    expect(event.data.station?.asset?.id).toBe("CLIP-9");
    expect(event.data.station?.asset?.name).toBe("Nested caption");
    expect(event.data.station?.asset?.sub?.id).toBe("live|77");
    expect(event.data.station?.asset?.sub?.name).toBe("Show X");
  });

  it("station.asset.sub.id falls back to podcast|<podcast_id> when no station_id", () => {
    const podcastOnly = { ...samplePayload, station_id: undefined };
    const event = buildStreamStart(podcastOnly, snapshot);
    expect(event.data.station?.asset?.sub?.id).toBe("podcast|POD-100");
  });

  it("station.playedFrom keeps the older numeric 431 by default", () => {
    const event = buildStreamStart({ ...samplePayload, autoplay: false }, snapshot);
    expect(event.data.station?.playedFrom).toBe(431);
  });

  it("station.playedFrom is 432 for the requested embed_id", () => {
    const event = buildStreamStart({ ...samplePayload, embed_id: "69c38273686a088a80a25ea2" }, snapshot);
    expect(event.data.station?.playedFrom).toBe(432);
  });

  it("station.playedFrom is 433 for the requested placement_id", () => {
    const event = buildStreamStart({ ...samplePayload, placement_id: "69c2812fd98484cf6b83a5ba" }, snapshot);
    expect(event.data.station?.playedFrom).toBe(433);
  });

  it("buildTrackEnd -> track_end with derived reason + dual-send listenTime", () => {
    const event = buildTrackEnd(samplePayload, snapshot, "next");
    expect(event.type).toBe("track_end");
    expect(event.data.station?.endReason).toBe("next");
    expect(event.data.station?.listenTime).toBe(42);
  });

  it("buildTrackEnd computes completionRate from listenTime/video_length (clamped 0..1)", () => {
    // listenTime 42 / video_length 84 = 0.5
    const half = buildTrackEnd({ ...samplePayload, video_length: 84 }, snapshot, "next");
    expect(half.data.station?.completionRate).toBe(0.5);
    // Watched past the end clamps to 1.
    const full = buildTrackEnd({ ...samplePayload, video_length: 30 }, snapshot, "next");
    expect(full.data.station?.completionRate).toBe(1);
    // Missing duration -> field omitted.
    const unknown = buildTrackEnd(samplePayload, snapshot, "next");
    expect(unknown.data.station?.completionRate).toBeUndefined();
  });

  it("buildStreamEnd -> stream_end with reason + exitSpot + listenTime", () => {
    const event = buildStreamEnd(samplePayload, snapshot, "stop");
    expect(event.type).toBe("stream_end");
    expect(event.data.station?.endReason).toBe("stop");
    expect(event.data.station?.exitSpot).toBe("music");
    expect(event.data.station?.listenTime).toBe(42);
  });

  it("buildPause -> pause WITHOUT the NEW trio (per spec) and omits event.location", () => {
    const event = buildPause(samplePayload, snapshot);
    expect(event.type).toBe("pause");
    expect(event.data.streamFeedPosition).toBeUndefined();
    expect(event.data).not.toHaveProperty("event.location");
    expect(event.data.station?.sessionId).toBe("sess-1");
  });

  it("buildShare -> share with snake_cased platform + clip asset name", () => {
    const event = buildShare({ ...samplePayload, share_method: "Native Share" });
    expect(event.type).toBe("share");
    expect(event.data.share?.platform).toBe("nativeShare");
    expect(event.data.station?.asset?.name).toBe("Knicks parade clip");
    expect(event.data.station?.asset?.sub?.name).toBe("Z100");
  });

  it("buildScreenView -> screen_view: pageName top-level, parent at view.asset", () => {
    const event = buildScreenView(samplePayload);
    expect(event.type).toBe("screen_view");
    expect(event.data.pageName).toBe("live_profile");
    expect(event.data.view?.pageURL).toBe("https://z100.iheart.com/content/abc");
    expect(event.data.view?.asset?.id).toBe("live|1469");
    expect(event.data.view?.asset?.name).toBe("Z100");
    expect(event.data.view?.asset?.sub?.id).toBe("live|highlights");
  });

  it("buildPlay -> play carries playedFrom + sessionId + view.pageName", () => {
    const event = buildPlay(samplePayload, snapshot);
    expect(event.type).toBe("play");
    expect(event.data.station?.sessionId).toBe("sess-1");
    expect(event.data.station?.playedFrom).toBe(431);
    expect(event.data.view?.pageName).toBe("live_profile");
  });
});
