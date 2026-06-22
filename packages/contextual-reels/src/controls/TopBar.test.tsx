import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { TopBar } from "@cxr/controls/TopBar";

vi.mock("./topbar/DefaultTopBar", () => ({
  DefaultTopBar: (props: { variant?: string }) =>
    React.createElement("div", { "data-testid": "default-top-bar", "data-variant": props.variant }),
}));

describe("TopBar router", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  async function render(overrides: Partial<React.ComponentProps<typeof TopBar>> = {}) {
    await act(async () => {
      root.render(
        React.createElement(TopBar, {
          variant: "default",
          isFullScreen: false,
          isMuted: false,
          isPlay: true,
          onMuteClick: vi.fn(),
          onPlayClick: vi.fn(),
          onFullScreenClick: vi.fn(),
          ...overrides,
        })
      );
    });
  }

  it("variant=default renders DefaultTopBar with variant=default", async () => {
    await render({ variant: "default" });
    const bar = container.querySelector('[data-testid="default-top-bar"]');
    expect(bar).toBeTruthy();
    expect(bar?.getAttribute("data-variant")).toBe("default");
  });

  it("variant=iheart renders DefaultTopBar with variant=iheart", async () => {
    await render({ variant: "iheart" });
    const bar = container.querySelector('[data-testid="default-top-bar"]');
    expect(bar).toBeTruthy();
    expect(bar?.getAttribute("data-variant")).toBe("iheart");
  });
});
