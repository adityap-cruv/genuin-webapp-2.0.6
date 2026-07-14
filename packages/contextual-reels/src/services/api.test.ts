/**
 * Tests for `src/services/api.ts`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  handleResponse,
  __createApiFetch,
  apiFetch,
  getTag,
  getIpInfo,
  getSharedGeoIp,
  __resetGeoIpCache,
} from "@cxr/services/api";

// ─── handleResponse ───────────────────────────────────────────────────────────

describe("services/handleResponse", () => {
  it("returns response.data.data when the nested envelope is present", () => {
    const result = handleResponse({ data: { data: { foo: 1 } } });
    expect(result).toEqual({ foo: 1 });
  });

  it("falls back to response.data when no nested envelope is present", () => {
    const result = handleResponse({ data: { foo: 1 } });
    expect(result).toEqual({ foo: 1 });
  });

  it('throws "No Data found" when response is null/undefined', () => {
    // @ts-expect-error — exercising the runtime guard with a deliberately invalid input.
    expect(() => handleResponse(null)).toThrow("No Data found");
    // @ts-expect-error — exercising the runtime guard with a deliberately invalid input.
    expect(() => handleResponse(undefined)).toThrow("No Data found");
  });

  it('throws "No Data found" when response.data is missing', () => {
    expect(() => handleResponse({} as { data?: unknown })).toThrow("No Data found");
  });

  it("returns nested data even when it is a non-object", () => {
    expect(handleResponse({ data: { data: "literal" } })).toBe("literal");
  });
});

// ─── __createApiFetch / apiFetch ─────────────────────────────────────────────

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("services/__createApiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches x-user-id and x-url when the request targets the apiurl host", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "https://api.test.example",
      getUserId: () => "uid-42",
      getLocation: () => "https://host.example/page",
    });

    await apiFetch("/v1/foo");

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    const headers = init.headers as Headers;
    expect(headers.get("x-user-id")).toBe("uid-42");
    expect(headers.get("x-url")).toBe("https://host.example/page");

    vi.unstubAllGlobals();
  });

  it("merges caller-supplied init.headers with the injected auth headers", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "https://api.test.example",
      getUserId: () => "uid-7",
      getLocation: () => "https://host.example/page",
    });

    // Passing init WITH headers exercises the `init?.headers` truthy branch.
    await apiFetch("/v1/foo", { headers: { "x-custom": "kept" } });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    const headers = init.headers as Headers;
    expect(headers.get("x-custom")).toBe("kept");
    expect(headers.get("x-user-id")).toBe("uid-7");

    vi.unstubAllGlobals();
  });

  it("attaches headers when an absolute URL still targets the apiurl host", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "https://api.test.example",
      getUserId: () => "uid-1",
      getLocation: () => "https://host.example/page",
    });

    await apiFetch("https://api.test.example/v1/foo");

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    const headers = init.headers as Headers;
    expect(headers.get("x-user-id")).toBe("uid-1");
    expect(headers.get("x-url")).toBe("https://host.example/page");

    vi.unstubAllGlobals();
  });

  it("does NOT attach headers when the request targets a different host", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "https://api.test.example",
      getUserId: () => "uid-1",
      getLocation: () => "https://host.example/page",
    });

    await apiFetch("https://third-party.example/track");

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    const headers = init.headers as Headers;
    expect(headers.get("x-user-id")).toBeNull();
    expect(headers.get("x-url")).toBeNull();

    vi.unstubAllGlobals();
  });

  it("omits x-url when getLocation returns undefined", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "https://api.test.example",
      getUserId: () => "uid-1",
      getLocation: () => undefined,
    });

    await apiFetch("/v1/foo");

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    const headers = init.headers as Headers;
    expect(headers.get("x-user-id")).toBe("uid-1");
    expect(headers.get("x-url")).toBeNull();

    vi.unstubAllGlobals();
  });

  it("resolves relative URL against apiurl base", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "https://api.test.example",
      getUserId: () => "uid-1",
      getLocation: () => undefined,
    });

    await apiFetch("/v1/foo");

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toBe("https://api.test.example/v1/foo");

    vi.unstubAllGlobals();
  });

  it("passes absolute URL through unchanged", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "https://api.test.example",
      getUserId: () => "uid-1",
      getLocation: () => undefined,
    });

    await apiFetch("https://other.example/path");

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toBe("https://other.example/path");

    vi.unstubAllGlobals();
  });

  it("exports a singleton apiFetch bound to the production env at module load", async () => {
    const mod = await import("./api");
    expect(typeof mod.apiFetch).toBe("function");
  });

  it("singleton apiFetch invokes its getUserId/getLocation deps against the prod host", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    // Hits the prod apiurl host so the header-injection branch runs, which in
    // turn calls the singleton's getUserId() / getLocation() arrow deps.
    await apiFetch("/goservices/ad_creative?tag_id=t-1");

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(url).toBe("https://api.begenuin.com/goservices/ad_creative?tag_id=t-1");
    const headers = init.headers as Headers;
    // userId is a non-empty per-page-load id resolved via the getUserId() dep.
    expect(headers.get("x-user-id")).toBeTruthy();

    vi.unstubAllGlobals();
  });

  it("skips header injection when apiurl host cannot be parsed", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    const apiFetch = __createApiFetch({
      apiurl: "not-a-url",
      getUserId: () => "uid-1",
      getLocation: () => "https://host.example/page",
    });

    await apiFetch("/foo");

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    const headers = init.headers as Headers;
    expect(headers.get("x-user-id")).toBeNull();

    vi.unstubAllGlobals();
  });
});

// ─── getTag ───────────────────────────────────────────────────────────────────

describe("services/getTag", () => {
  it("GETs /goservices/ad_creative with the tag_id param and unwraps the envelope", async () => {
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse({ data: { data: { id: "t-1", name: "unit" } } }));

    const result = await getTag("t-1", mockFetch);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("/goservices/ad_creative");
    expect(url).toContain("tag_id=t-1");
    expect(result).toEqual({ id: "t-1", name: "unit" });
  });

  it("propagates errors from the fetch function", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(getTag("t-2", mockFetch)).rejects.toThrow("boom");
  });

  it('throws "No Data found" when the response has no payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse({}));
    await expect(getTag("t-3", mockFetch)).rejects.toThrow("No Data found");
  });
});

// ─── getIpInfo ────────────────────────────────────────────────────────────────

describe("services/getIpInfo", () => {
  it("GETs /goservices/data/ip_info and returns flat JSON directly", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(makeFetchResponse({ city: "Bangalore", country: "IN" }));

    const result = await getIpInfo(mockFetch);

    expect(mockFetch).toHaveBeenCalledWith("/goservices/data/ip_info");
    expect(result).toEqual({ city: "Bangalore", country: "IN" });
  });

  it("propagates errors from the fetch function", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("network"));
    await expect(getIpInfo(mockFetch)).rejects.toThrow("network");
  });
});

// ─── getSharedGeoIp ────────────────────────────────────────────────────────────

describe("services/getSharedGeoIp", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    __resetGeoIpCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("fetches geoip via the default apiFetch and resolves the parsed response", async () => {
    global.fetch = vi.fn().mockResolvedValue(makeFetchResponse({ city: "Bangalore" })) as unknown as typeof fetch;

    const result = await getSharedGeoIp();

    expect(result).toEqual({ city: "Bangalore" });
  });

  it("caches the result — concurrent/repeat callers share one network call", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeFetchResponse({ city: "Bangalore" }));
    global.fetch = fetchSpy as unknown as typeof fetch;

    const [first, second] = await Promise.all([getSharedGeoIp(), getSharedGeoIp()]);
    const third = await getSharedGeoIp();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ city: "Bangalore" });
    expect(second).toEqual({ city: "Bangalore" });
    expect(third).toEqual({ city: "Bangalore" });
  });

  it("resolves null (never rejects) and logs when the underlying fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network")) as unknown as typeof fetch;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await getSharedGeoIp();

    expect(result).toBeNull();
    expect(errSpy).toHaveBeenCalledWith("[cxr/services-api]", "error :", expect.any(Error));
    errSpy.mockRestore();
  });

  it("does not retry after a failure — the null result is cached too", async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error("network"));
    global.fetch = fetchSpy as unknown as typeof fetch;
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await getSharedGeoIp();
    const second = await getSharedGeoIp();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(second).toBeNull();
  });
});
