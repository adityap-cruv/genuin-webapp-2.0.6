/**
 * Tests for App.tsx — written FIRST per TDD mandate.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock all providers and heavy deps
vi.mock("../providers/AnalyticsProvider", () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "analytics-provider" }, children),
  useAnalytics: vi.fn(() => ({ sendEvent: vi.fn() })),
}));

vi.mock("../providers/ConfigProvider", () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "config-provider" }, children),
  useConfig: vi.fn(() => ({
    tagDetails: {},
    rootTagId: "",
    tagId: "",
    isGenAiEnabled: false,
  })),
}));

vi.mock("../providers/FeedProvider", () => ({
  FeedProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "feed-provider" }, children),
  useFeed: vi.fn(() => ({ entries: [], activeIndex: 0 })),
}));

vi.mock("../providers/PlayerProvider", () => ({
  PlayerProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "player-provider" }, children),
  usePlayer: vi.fn(() => ({ isMuted: true, isPlaying: false, setMuted: vi.fn(), setPlaying: vi.fn() })),
}));

vi.mock("../providers/AdProvider", () => ({
  AdProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "ad-provider" }, children),
  useAdWaterfall: vi.fn(() => ({ onAdSuccess: vi.fn(), onAdFail: vi.fn() })),
}));

vi.mock("../feed/Feed", () => ({
  Feed: () => React.createElement("div", { "data-testid": "feed" }),
}));

vi.mock("../instance/registry/InstanceContext", () => ({
  InstanceProvider: ({ children }: { children: React.ReactNode }) => children,
  useInstanceId: vi.fn(() => "test-instance"),
}));

vi.mock("../instance/coordination/EventBusContext", () => ({
  EventBusProvider: ({ children }: { children: React.ReactNode }) => children,
  useEventBus: vi.fn(() => ({
    on: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  })),
}));

vi.mock("../instance/registry/useInstanceRegistration", () => ({
  useInstanceRegistration: vi.fn(),
}));

vi.mock("../feed/hooks/usePlayerCoordination", () => ({
  usePlayerCoordination: vi.fn(),
}));

vi.mock("../services/api", () => ({
  getTag: vi.fn().mockResolvedValue({
    tag_id: "tag-1",
    config: {},
    cta: { delay: 3 },
  }),
}));

import App from "@cxr/app/App";

describe("App", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    // Mock location for feature flag
    Object.defineProperty(window, "location", {
      value: { search: "" },
      configurable: true,
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(props: Partial<React.ComponentProps<typeof App>> = {}) {
    act(() => {
      root.render(
        React.createElement(App, {
          tagId: "tag-1",
          rootTagId: "root-1",
          adLayout: "unknown",
          instanceId: "test-instance",
          ...props,
        })
      );
    });
  }

  it("renders the overlay container", () => {
    render();
    expect(container.querySelector("#overlay-test-instance")).toBeTruthy();
  });

  it("wraps with AnalyticsProvider", () => {
    render();
    expect(container.querySelector('[data-testid="analytics-provider"]')).toBeTruthy();
  });

  it("does not render a close button", () => {
    render({ adLayout: "mobile-320x50" });
    expect(container.querySelector(".cxr__close-button")).toBeNull();
  });
});
