/**
 * Tests for the Rudderstack initialisation helper.
 *
 * Snapshot covers the inlined snippet so future drift surfaces in review.
 * The snippet is verbatim from the legacy `analytics_service.js` (other than
 * the parameter substitution for write-key + dataplane URL).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { initializeRudderAnalytics, RUDDER_SNIPPET_VERSION } from "@cxr/analytics/rudderstack";

interface RudderWindow extends Window {
  rudderanalytics?: unknown;
}

describe("analytics/rudderstack", () => {
  beforeEach(() => {
    delete (window as RudderWindow).rudderanalytics;
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports the Rudderstack snippet version constant", () => {
    expect(RUDDER_SNIPPET_VERSION).toBe("3.0.3");
  });

  it("returns undefined and console.infos when rudderanalytics is already initialised", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    (window as RudderWindow).rudderanalytics = { existing: true };
    const result = initializeRudderAnalytics();
    expect(result).toBeUndefined();
    expect(infoSpy).toHaveBeenCalledWith("[cxr/rudderstack]", "RudderAnalytics is already initialized.");
    expect(document.body.querySelector("script")).toBeNull();
  });

  it("injects a <script> with the version + dataplane embedded", () => {
    initializeRudderAnalytics();
    const script = document.body.querySelector("script");
    expect(script).not.toBeNull();
    const src = script?.innerHTML ?? "";
    expect(src).toContain('window.RudderSnippetVersion = "3.0.3"');
    expect(src).toContain("https://etr.begenuin.com");
  });

  it("matches the canonical snippet snapshot", () => {
    initializeRudderAnalytics();
    const script = document.body.querySelector("script");
    expect(script?.innerHTML).toMatchSnapshot();
  });

  it("returns a cleanup that removes the script node", () => {
    const cleanup = initializeRudderAnalytics();
    expect(typeof cleanup).toBe("function");
    expect(document.body.querySelectorAll("script")).toHaveLength(1);
    cleanup?.();
    expect(document.body.querySelectorAll("script")).toHaveLength(0);
  });
});
