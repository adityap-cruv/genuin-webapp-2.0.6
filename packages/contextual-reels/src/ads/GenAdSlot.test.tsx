/**
 * Tests for `GenAdSlot` presentation component.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { GenAdSlot, type GenAdSlotProps } from "@cxr/ads/GenAdSlot";

// ---------------------------------------------------------------------------
// Mock useGenAdInstance so we can control adLoaded / provider
// ---------------------------------------------------------------------------
let mockAdLoaded = false;
let mockProvider: string | null = null;
const mockContainerId = "gen-ad-slot-1";

vi.mock("./genAdSdk", () => ({
  useGenAdInstance: () => ({
    adLoaded: mockAdLoaded,
    provider: mockProvider,
    containerId: mockContainerId,
  }),
}));

// ---------------------------------------------------------------------------
// Mock useAdWaterfall so GenAdSlot can read adLayout / isAudioOnlyAds
// ---------------------------------------------------------------------------
let mockAdLayout = "unknown";

vi.mock("../providers/AdProvider", () => ({
  useAdWaterfall: () => ({
    adLayout: mockAdLayout,
    isAudioOnlyAds: mockAdLayout === "mobile-320x50" || mockAdLayout === "mobile-320x100",
    onAdSuccess: vi.fn(),
    onAdFail: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { root, container };
}

function unmount(root: Root, container: HTMLDivElement): void {
  act(() => root.unmount());
  container.remove();
}

const baseProps: GenAdSlotProps = {
  id: 1,
  instanceId: "test-instance",
  isActive: false,
  isMuted: false,
  platforms: {},
  item: {},
  destroySignal: 0,
  dimensions: { width: 300, height: 250 },
  isFullScreen: false,
  isPlay: false,
  isAudioAds: false,
};

describe("ads/GenAdSlot", () => {
  beforeEach(() => {
    mockAdLoaded = false;
    mockProvider = null;
    mockAdLayout = "unknown";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders outer div with data-testid="gen-ad-slot"', () => {
    const { root, container } = mount(<GenAdSlot {...baseProps} />);
    const slot = container.querySelector('[data-testid="gen-ad-slot"]');
    expect(slot).not.toBeNull();
    unmount(root, container);
  });

  it("renders shimmer when adLoaded is false", () => {
    mockAdLoaded = false;
    const { root, container } = mount(<GenAdSlot {...baseProps} />);
    const slot = container.querySelector('[data-testid="gen-ad-slot"]');
    expect(slot).not.toBeNull();
    unmount(root, container);
  });

  it("does not render shimmer when adLoaded is true", () => {
    mockAdLoaded = true;
    const { root, container } = mount(<GenAdSlot {...baseProps} />);
    const shimmer = container.querySelector('[data-testid="shimmer"]') ?? container.querySelector(".shimmer");
    expect(shimmer).toBeNull();
    unmount(root, container);
  });

  it("renders audio-ad controls for 320x100 layout when isAudioAds is true and adLoaded", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x100";
    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 100 }}
        adLoaded={true}
      />
    );
    const slot = container.querySelector('[data-testid="gen-ad-slot"]');
    expect(slot).not.toBeNull();
    unmount(root, container);
  });

  it("renders the sdk mount target div with the containerId", () => {
    const { root, container } = mount(<GenAdSlot {...baseProps} />);
    const mountTarget = document.body.querySelector(`#${mockContainerId}`);
    expect(mountTarget).not.toBeNull();
    unmount(root, container);
  });

  it("uses 100% dimensions when no dimensions provided", () => {
    const { root, container } = mount(<GenAdSlot {...baseProps} dimensions={undefined} />);
    const slot = container.querySelector('[data-testid="gen-ad-slot"]') as HTMLElement;
    expect(slot?.style.height).toBe("100%");
    expect(slot?.style.width).toBe("100%");
    unmount(root, container);
  });

  it("uses pixel dimensions when dimensions.height/width > 0", () => {
    const { root, container } = mount(<GenAdSlot {...baseProps} dimensions={{ width: 320, height: 100 }} />);
    const slot = container.querySelector('[data-testid="gen-ad-slot"]') as HTMLElement;
    expect(slot?.style.height).toBe("100px");
    expect(slot?.style.width).toBe("320px");
    unmount(root, container);
  });

  it("uses 100% dimensions in fullscreen mode", () => {
    const { root, container } = mount(
      <GenAdSlot {...baseProps} isFullScreen={true} dimensions={{ width: 320, height: 100 }} />
    );
    const slot = container.querySelector('[data-testid="gen-ad-slot"]') as HTMLElement;
    expect(slot?.style.height).toBe("100%");
    expect(slot?.style.width).toBe("100%");
    unmount(root, container);
  });

  it("applies parent-override adLoaded prop when provided", () => {
    const { root, container } = mount(<GenAdSlot {...baseProps} adLoaded={true} />);
    const slot = container.querySelector('[data-testid="gen-ad-slot"]');
    expect(slot).not.toBeNull();
    unmount(root, container);
  });

  it("renders with isAudioAds=false (no audio controls)", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x50";
    const { root, container } = mount(
      <GenAdSlot {...baseProps} isAudioAds={false} adLoaded={true} />
    );
    const slot = container.querySelector('[data-testid="gen-ad-slot"]');
    expect(slot).not.toBeNull();
    unmount(root, container);
  });

  it("shows audio-ad tap target when showAudioAdControls is true", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x50";
    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 50 }}
        isFullScreen={false}
        adLoaded={true}
      />
    );
    const slot = container.querySelector('[data-testid="gen-ad-slot"]');
    expect(slot).not.toBeNull();
    unmount(root, container);
  });

  it("renders gen-ad-slot when onFullScreenClick is provided", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x50";
    const onFullScreenClick = vi.fn();

    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 50 }}
        adLoaded={true}
        onFullScreenClick={onFullScreenClick}
      />
    );

    expect(container.querySelector('[data-testid="gen-ad-slot"]')).not.toBeNull();
    unmount(root, container);
  });

  it("renders gen-ad-slot for 320x100 isAudioAds layout", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x100";
    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 100 }}
        isFullScreen={false}
        adLoaded={true}
      />
    );

    expect(container.querySelector('[data-testid="gen-ad-slot"]')).not.toBeNull();
    unmount(root, container);
  });

  it("renders mute control when provider is video and adLoaded (non-audio-only)", () => {
    mockAdLoaded = true;
    mockProvider = "video";
    mockAdLayout = "desktop-300x250";

    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={false}
        dimensions={{ width: 300, height: 250 }}
        adLoaded={true}
      />
    );
    const slot = container.querySelector('[data-testid="gen-ad-slot"]');
    expect(slot).not.toBeNull();
    unmount(root, container);
  });

  it("renders gen-ad-slot for 320x100 layout", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x100";
    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 100 }}
        adLoaded={true}
      />
    );

    expect(container.querySelector('[data-testid="gen-ad-slot"]')).not.toBeNull();
    unmount(root, container);
  });

  it("renders sdk mount target for mobile-320x100 layout", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x100";
    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 100 }}
        isFullScreen={false}
        adLoaded={true}
      />
    );
    const mountTarget = document.body.querySelector(`#${mockContainerId}`);
    expect(mountTarget).not.toBeNull();
    unmount(root, container);
  });

  it("does not render linkout for mobile-320x50 layout", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x50";
    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 50 }}
        isFullScreen={false}
        adLoaded={true}
      />
    );
    const linkout = container.querySelector('a[href*="starbucks"]');
    expect(linkout).toBeNull();
    unmount(root, container);
  });

  it("renders sdk mount target div with correct id for 320x100 layout", () => {
    mockAdLoaded = true;
    mockAdLayout = "mobile-320x100";
    const { root, container } = mount(
      <GenAdSlot
        {...baseProps}
        isAudioAds={true}
        dimensions={{ width: 320, height: 100 }}
        isFullScreen={false}
        adLoaded={true}
      />
    );
    const mountTarget = document.body.querySelector(`#${mockContainerId}`) as HTMLDivElement;
    expect(mountTarget).not.toBeNull();
    unmount(root, container);
  });

  it("invokes onAdLoadedChange with the current adLoaded state when provided", () => {
    mockAdLoaded = true;
    const onAdLoadedChange = vi.fn();
    const { root, container } = mount(<GenAdSlot {...baseProps} onAdLoadedChange={onAdLoadedChange} />);
    // The effect must forward the hook's adLoaded value to the parent callback.
    expect(onAdLoadedChange).toHaveBeenCalledWith(true);
    unmount(root, container);
  });
});
