/**
 * Tests for `src/services/feed.ts` (renamed from createFeedGenerator).
 */
import { describe, it, expect, vi } from "vitest";

import { createFeedGenerator } from "@cxr/services/feed";

function makeFetchResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    // feed now parses via parseJsonResponse, which reads .text() first.
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function makeFetch(...responses: unknown[]): ReturnType<typeof vi.fn> {
  const fn = vi.fn();
  for (const r of responses) fn.mockResolvedValueOnce(makeFetchResponse(r));
  return fn;
}

describe("services/createFeedGenerator", () => {
  it("emits batch_started then feed_api_call_completed on the first call", async () => {
    const sendEvent = vi.fn();
    const fetchFn = makeFetch({ data: { data: { ref: "r1", reels: [{ id: "a" }] } } });
    const fetchBatch = createFeedGenerator({
      tagId: "t-1",
      fetchFn,
      sendEvent,
      getWindowLink: () => "https://host.example",
    });
    const reels = await fetchBatch();
    expect(reels).toEqual([{ id: "a" }]);
    expect(sendEvent.mock.calls.map((c) => c[0])).toEqual(["Batch Started", "Feed API Call Completed"]);
  });

  it("emits batch_completed on subsequent calls", async () => {
    const sendEvent = vi.fn();
    const fetchFn = makeFetch(
      { data: { data: { ref: "r1", reels: [{ id: "a" }] } } },
      { data: { data: { ref: "r2", reels: [{ id: "b" }] } } }
    );
    const fetchBatch = createFeedGenerator({
      tagId: "t-1",
      fetchFn,
      sendEvent,
      getWindowLink: () => "https://host.example",
    });
    await fetchBatch();
    sendEvent.mockClear();
    await fetchBatch();
    expect(sendEvent.mock.calls.map((c) => c[0])).toEqual([
      "Batch Started",
      "Batch Completed",
      "Feed API Call Completed",
    ]);
  });

  it("emits feed_completed + tag_displayed when reels[] is empty and short-circuits next calls", async () => {
    const sendEvent = vi.fn();
    const fetchFn = makeFetch({ data: { data: { ref: "r1", reels: [] } } });
    const fetchBatch = createFeedGenerator({
      tagId: "t-1",
      fetchFn,
      sendEvent,
      getWindowLink: () => "https://host.example",
    });
    const first = await fetchBatch();
    expect(first).toEqual([]);
    expect(sendEvent.mock.calls.map((c) => c[0])).toEqual([
      "Batch Started",
      "Feed API Call Completed",
      "Feed Completed",
      "Tag Displayed",
    ]);
    sendEvent.mockClear();
    const second = await fetchBatch();
    expect(second).toEqual([]);
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it("passes tag_id and url params and threads the ref between calls", async () => {
    const sendEvent = vi.fn();
    const fetchFn = makeFetch(
      { data: { data: { ref: "r1", reels: [{ id: "a" }] } } },
      { data: { data: { ref: "r2", reels: [{ id: "b" }] } } }
    );
    const fetchBatch = createFeedGenerator({
      tagId: "t-1",
      fetchFn,
      sendEvent,
      getWindowLink: () => "https://host.example",
    });
    await fetchBatch();
    await fetchBatch();

    const [url1] = fetchFn.mock.calls[0] as [string];
    expect(url1).toContain("tag_id=t-1");
    expect(url1).toContain("url=https%3A%2F%2Fhost.example");
    expect(url1).not.toContain("ref="); // no ref on first call

    const [url2] = fetchFn.mock.calls[1] as [string];
    expect(url2).toContain("tag_id=t-1");
    expect(url2).toContain("ref=r1");
  });

  it("falls back to the default apiFetch when no fetchFn is supplied", () => {
    const fetchBatch = createFeedGenerator({
      tagId: "t-no-client",
      sendEvent: vi.fn(),
      getWindowLink: () => "https://host.example",
    });
    expect(typeof fetchBatch).toBe("function");
  });

  it("invokes the default getWindowLink lambda when the caller does not provide one", async () => {
    const sendEvent = vi.fn();
    const fetchFn = makeFetch({ data: { data: { ref: "r1", reels: [{ id: "a" }] } } });
    const fetchBatch = createFeedGenerator({
      tagId: "t-defaults",
      sendEvent,
      fetchFn,
    });
    const reels = await fetchBatch();
    expect(reels).toEqual([{ id: "a" }]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("produces the canonical 4-call event sequence end-to-end", async () => {
    const sendEvent = vi.fn();
    const fetchFn = makeFetch(
      { data: { data: { ref: "r1", reels: [{ id: "a" }] } } },
      { data: { data: { ref: "r2", reels: [{ id: "b" }] } } },
      { data: { data: { ref: "r3", reels: [] } } }
    );
    const fetchBatch = createFeedGenerator({
      tagId: "t-1",
      fetchFn,
      sendEvent,
      getWindowLink: () => "https://host.example",
    });
    await fetchBatch(); // #1
    await fetchBatch(); // #2
    await fetchBatch(); // #3 (empty → finalises)
    await fetchBatch(); // #4 (no-op)
    expect(sendEvent.mock.calls.map((c) => c[0])).toEqual([
      "Batch Started",
      "Feed API Call Completed",
      "Batch Started",
      "Batch Completed",
      "Feed API Call Completed",
      "Batch Started",
      "Batch Completed",
      "Feed API Call Completed",
      "Feed Completed",
      "Tag Displayed",
    ]);
  });
});
