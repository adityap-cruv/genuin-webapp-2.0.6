import type { EmblaCarouselType } from "embla-carousel";
import React, { useRef } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { sendEventMock } = vi.hoisted(() => ({ sendEventMock: vi.fn() }));
vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setBrandId: vi.fn() }),
}));

import { useEmblaFeed } from "@cxr/feed/useFeedNavigation";
import type { UseFeedNavigationResult } from "@cxr/feed/useFeedNavigation";

// ─── Mock Embla API ───────────────────────────────────────────────────────────

type EmblaEventListener = () => void;

interface MockEmblaApi {
  api: EmblaCarouselType;
  /** Trigger the 'select' event as if Embla snapped to a new slide. */
  fireSelect: (snapIndex: number) => void;
  /** Trigger the 'slidesInView' event with a new set of in-view indices. */
  fireSlidesInView: (indices: number[]) => void;
}

function makeMockEmblaApi(initialSnap = 0): MockEmblaApi {
  const listeners: Record<string, EmblaEventListener[]> = {};
  let currentSnap = initialSnap;
  let inView = [initialSnap];

  const api = {
    selectedScrollSnap: vi.fn(() => currentSnap),
    slidesInView: vi.fn(() => inView),
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    scrollTo: vi.fn(),
    on: vi.fn((event: string, cb: EmblaEventListener) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
    }),
    off: vi.fn((event: string, cb: EmblaEventListener) => {
      listeners[event] = (listeners[event] ?? []).filter((l) => l !== cb);
    }),
    destroy: vi.fn(),
  } as unknown as EmblaCarouselType;

  const fireSelect = (snapIndex: number): void => {
    currentSnap = snapIndex;
    (listeners["select"] ?? []).forEach((cb) => cb());
  };

  const fireSlidesInView = (indices: number[]): void => {
    inView = indices;
    (listeners["slidesInView"] ?? []).forEach((cb) => cb());
  };

  return { api, fireSelect, fireSlidesInView };
}

// ─── Test shim ────────────────────────────────────────────────────────────────

let captured: UseFeedNavigationResult = {
  activeIndex: 0,
  goNext: () => {},
  goPrev: () => {},
  goTo: () => {},
  autoAdvance: () => {},
  onTimeUpdate: () => {},
  visibleIndices: new Set<number>(),
};

interface ShimProps {
  emblaApi: EmblaCarouselType | null;
  itemCount: number;
  disabled?: boolean;
  onSlideAway: (index: number, timerData: { currentTime: number; duration: number } | undefined) => void;
  onSlideEnter: (index: number) => void;
  onTimeUpdate: (index: number, currentTime: number, duration: number) => void;
}

function Shim(props: ShimProps): null {
  // Wrap the api in a ref so it matches the updated useEmblaFeed signature.
  const emblaApiRef = useRef<EmblaCarouselType | null>(props.emblaApi);
  emblaApiRef.current = props.emblaApi;
  const result = useEmblaFeed(emblaApiRef, {
    itemCount: props.itemCount,
    disabled: props.disabled,
    onSlideAway: props.onSlideAway,
    onSlideEnter: props.onSlideEnter,
    onTimeUpdate: props.onTimeUpdate,
  });
  captured = result;
  return null;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useEmblaFeed", () => {
  let container: HTMLDivElement;
  let root: Root;
  let onSlideAway: ReturnType<typeof vi.fn>;
  let onSlideEnter: ReturnType<typeof vi.fn>;
  let onTimeUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendEventMock.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    onSlideAway = vi.fn();
    onSlideEnter = vi.fn();
    onTimeUpdate = vi.fn();
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(emblaApi: EmblaCarouselType | null, itemCount = 5, disabled?: boolean) {
    act(() => {
      root.render(
        React.createElement(Shim, {
          emblaApi,
          itemCount,
          disabled,
          onSlideAway,
          onSlideEnter,
          onTimeUpdate,
        })
      );
    });
  }

  it("initialises with activeIndex=0", () => {
    const { api } = makeMockEmblaApi(0);
    render(api);
    expect(captured.activeIndex).toBe(0);
  });

  it("activeIndex updates when Embla fires select", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      fireSelect(2);
    });
    expect(captured.activeIndex).toBe(2);
  });

  it("calls onSlideAway with previous index when select fires", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      fireSelect(1);
    });
    expect(onSlideAway).toHaveBeenCalledWith(0, undefined);
  });

  it("calls onSlideEnter with new index when select fires", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      fireSelect(1);
    });
    expect(onSlideEnter).toHaveBeenCalledWith(1);
  });

  it("passes timerTracker data to onSlideAway after onTimeUpdate was called", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      captured.onTimeUpdate(0, 15, 60);
    });
    act(() => {
      fireSelect(1);
    });
    expect(onSlideAway).toHaveBeenCalledWith(0, { currentTime: 15, duration: 60 });
  });

  it("does not call onSlideAway when selectedScrollSnap returns same index", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    // Fire select but snap stays at 0
    act(() => {
      fireSelect(0);
    });
    expect(onSlideAway).not.toHaveBeenCalled();
  });

  it("does not call onSlideEnter on initial render", () => {
    const { api } = makeMockEmblaApi(0);
    render(api);
    expect(onSlideEnter).not.toHaveBeenCalled();
  });

  it("goNext delegates to emblaApi.scrollNext", () => {
    const { api } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      captured.goNext();
    });
    expect(api.scrollNext).toHaveBeenCalled();
  });

  it("goPrev delegates to emblaApi.scrollPrev", () => {
    const { api } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      captured.goPrev();
    });
    expect(api.scrollPrev).toHaveBeenCalled();
  });

  it("goTo delegates to emblaApi.scrollTo", () => {
    const { api } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      captured.goTo(3);
    });
    expect(api.scrollTo).toHaveBeenCalledWith(3);
  });

  it("handles null emblaApi gracefully — goNext/goPrev/goTo do not throw", () => {
    render(null);
    expect(() => {
      act(() => {
        captured.goNext();
      });
      act(() => {
        captured.goPrev();
      });
      act(() => {
        captured.goTo(2);
      });
    }).not.toThrow();
    expect(onSlideAway).not.toHaveBeenCalled();
  });

  it("tracks multiple sequential slide changes", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      fireSelect(1);
    });
    act(() => {
      fireSelect(2);
    });
    expect(onSlideAway).toHaveBeenCalledTimes(2);
    expect(onSlideEnter).toHaveBeenCalledTimes(2);
    expect(onSlideAway).toHaveBeenNthCalledWith(1, 0, undefined);
    expect(onSlideAway).toHaveBeenNthCalledWith(2, 1, undefined);
    expect(onSlideEnter).toHaveBeenNthCalledWith(1, 1);
    expect(onSlideEnter).toHaveBeenNthCalledWith(2, 2);
    expect(captured.activeIndex).toBe(2);
  });

  // ─── Swipe analytics ─────────────────────────────────────────────────────────

  it("tracks Swipe Next with auto_swipe: false when select moves to a higher index", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      fireSelect(1);
    });
    expect(sendEventMock).toHaveBeenCalledWith("Swipe Next", { auto_swipe: false });
  });

  it("tracks Swipe Previous with auto_swipe: false when select moves to a lower index", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      fireSelect(2);
    });
    act(() => {
      fireSelect(1);
    });
    expect(sendEventMock).toHaveBeenCalledWith("Swipe Previous", { auto_swipe: false });
  });

  it("tracks Swipe Next with auto_swipe: true when autoAdvance drove the transition", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      captured.autoAdvance();
    });
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    act(() => {
      fireSelect(1); // Embla settles on the next slide
    });
    expect(sendEventMock).toHaveBeenCalledWith("Swipe Next", { auto_swipe: true });
  });

  it("resets the auto_swipe flag after one transition — the next swipe is user-attributed", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      captured.autoAdvance();
    });
    act(() => {
      fireSelect(1);
    });
    act(() => {
      fireSelect(2); // user swipe after the auto-advance
    });
    expect(sendEventMock).toHaveBeenLastCalledWith("Swipe Next", { auto_swipe: false });
  });

  it("registers the select listener on the emblaApi", () => {
    const { api } = makeMockEmblaApi(0);
    render(api);
    expect(api.on).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("registers the slidesInView listener and updates visibleIndices when it fires", () => {
    const { api, fireSlidesInView } = makeMockEmblaApi(0);
    render(api);
    expect(api.on).toHaveBeenCalledWith("slidesInView", expect.any(Function));
    act(() => {
      fireSlidesInView([0, 1, 2]);
    });
    expect(captured.visibleIndices).toEqual(new Set([0, 1, 2]));
  });

  it("does nothing when select fires after the emblaApi is gone", () => {
    const { api, fireSelect } = makeMockEmblaApi(0);
    render(api);
    // Drop the API ref then fire — handleSelect must early-return, not throw,
    // and must not report any slide-away/enter transition.
    render(null);
    expect(() => {
      act(() => {
        fireSelect(1);
      });
    }).not.toThrow();
    expect(onSlideAway).not.toHaveBeenCalled();
    expect(onSlideEnter).not.toHaveBeenCalled();
  });

  it("does nothing when slidesInView fires after the emblaApi is gone", () => {
    const { api, fireSlidesInView } = makeMockEmblaApi(0);
    render(api);
    // Drop the API ref then fire — the handler must early-return, not throw.
    render(null);
    expect(() => {
      act(() => {
        fireSlidesInView([0, 1]);
      });
    }).not.toThrow();
  });

  it("deregisters the select listener on unmount", () => {
    const { api } = makeMockEmblaApi(0);
    render(api);
    act(() => {
      root.unmount();
    });
    expect(api.off).toHaveBeenCalledWith("select", expect.any(Function));
    // Rebuild root so afterEach unmount doesn't double-unmount
    root = createRoot(container);
  });
});
