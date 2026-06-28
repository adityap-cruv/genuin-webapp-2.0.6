import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { CxrEventBus } from '@cxr/instance/coordination/CxrEventBus';
import { EventBusProvider, useEventBus } from '@cxr/instance/coordination/EventBusContext';
import {
  UserInteractionProvider,
  useMarkUserInteracted,
} from '@cxr/instance/coordination/UserInteractionTracker';

import { AdControlBar } from './AdControlBar';

vi.mock('@cxr/config', () => ({
  assetLink: 'https://test.cdn/',
  AD_LAYOUT: { Unknown: 0, L1: 1, L2: 2, L3: 3, L4: 4 },
}));

// AdControlBar can render the context-bound V2 buttons (MuteUnmuteButtonV2 reads
// usePlayer). Mock the provider so the bar mounts in isolation regardless of the
// active design system. Old and V2 buttons share the same test ids, so the
// assertions below hold under either branch.
vi.mock('@cxr/providers/PlayerProvider', () => ({
  usePlayer: () => ({
    isMuted: false,
    isPlaying: false,
    volume: 100,
    setMuted: vi.fn(),
    setPlaying: vi.fn(),
    setVolume: vi.fn(),
  }),
}));

const defaultProps = {
  isPlay: false,
  isMuted: false,
  onPlayClick: () => undefined,
  onMuteClick: () => undefined,
  onFullScreenClick: () => undefined,
};

describe('AdControlBar', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  describe('layout=320x50', () => {
    it('renders mute, play, expand buttons', () => {
      act(() => { root.render(<AdControlBar {...defaultProps} layout="320x50" />); });
      expect(container.querySelector('[data-testid="mute-btn"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="play-pause-btn"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="topbar-expand"]')).not.toBeNull();
    });

    it('renders watch button', () => {
      act(() => { root.render(<AdControlBar {...defaultProps} layout="320x50" />); });
      expect(container.querySelector('[data-testid="watch-btn"]')).not.toBeNull();
    });
  });

  describe('layout=320x100', () => {
    it('renders watch button', () => {
      act(() => { root.render(<AdControlBar {...defaultProps} layout="320x100" />); });
      expect(container.querySelector('[data-testid="watch-btn"]')).not.toBeNull();
    });

    it('renders linkout when ctaDetails provided', () => {
      act(() => {
        root.render(
          <AdControlBar
            {...defaultProps}
            layout="320x100"
            ctaDetails={{ ctaUrl: 'https://x.com', ctaTitle: 'Buy Now', advertiserLogo: '', onClick: () => undefined }}
          />
        );
      });
      expect(container.querySelector('[data-testid="linkout-btn"]')).not.toBeNull();
    });

    it('hides linkout when ctaDetails missing', () => {
      act(() => { root.render(<AdControlBar {...defaultProps} layout="320x100" />); });
      expect(container.querySelector('[data-testid="linkout-btn"]')).toBeNull();
    });
  });

  describe('layout=default', () => {
    it('renders mute and expand in absolute top-right cluster', () => {
      act(() => { root.render(<AdControlBar {...defaultProps} layout="default" />); });
      expect(container.querySelector('[data-testid="mute-btn"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="topbar-expand"]')).not.toBeNull();
    });

    it('renders play button', () => {
      act(() => { root.render(<AdControlBar {...defaultProps} layout="default" />); });
      expect(container.querySelector('[data-testid="play-pause-btn"]')).not.toBeNull();
    });

    it('unmutes on the first tap of the sound-on enticement', () => {
      const onMuteClick = vi.fn();
      act(() => {
        root.render(<AdControlBar {...defaultProps} layout="default" isMuted onMuteClick={onMuteClick} />);
      });
      act(() => { (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click(); });
      // The enticement shows "sound on" while the ad is muted; the user taps for
      // audio, so the first tap must unmute regardless of the real `isMuted`.
      expect(onMuteClick).toHaveBeenCalledWith(false);
    });

    it('mutes on the second tap once the real state is in view', () => {
      const onMuteClick = vi.fn();
      // After the first tap the bar mirrors the real (unmuted) state, so the
      // next tap is a normal toggle back to muted.
      act(() => {
        root.render(<AdControlBar {...defaultProps} layout="default" isMuted={false} onMuteClick={onMuteClick} />);
      });
      act(() => { (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click(); });
      act(() => { (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click(); });
      expect(onMuteClick).toHaveBeenNthCalledWith(1, false);
      expect(onMuteClick).toHaveBeenNthCalledWith(2, true);
    });

    it('keeps the sound-on enticement after a GENERIC interaction (e.g. play/pause tap)', () => {
      // Regression: the App root marks any pointer-down as "interacted". The mute
      // icon must NOT flip to the real (muted) state on a play/pause or other
      // non-audio tap — it stays on the "sound on" enticement until an audio
      // action occurs. Driving useMarkUserInteracted simulates that generic tap.
      let mark: (() => void) | null = null;
      function Marker(): React.JSX.Element {
        mark = useMarkUserInteracted();
        return <span />;
      }
      act(() => {
        root.render(
          <EventBusProvider>
            <UserInteractionProvider>
              <Marker />
              <AdControlBar {...defaultProps} layout="default" isMuted />
            </UserInteractionProvider>
          </EventBusProvider>
        );
      });
      const iconBefore = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(iconBefore.getAttribute('src')).toContain('cxr/unmute.svg');

      // Generic interaction fires — icon must STAY on the enticement.
      act(() => mark!());
      const iconAfter = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(iconAfter.getAttribute('src')).toContain('cxr/unmute.svg');
    });

    it('reveals the real mute icon after an AUDIO action (mute:unmuted on a later system mute)', () => {
      // Simulates: user unmuted an earlier ad (an audio action → `mute:unmuted`),
      // then a SYSTEM mute on the next ad sets isMuted=true. The icon must reveal
      // the muted state, not stay on "sound on".
      let bus: CxrEventBus | null = null;
      function BusGrabber(): React.JSX.Element {
        bus = useEventBus();
        return <span />;
      }
      act(() => {
        root.render(
          <EventBusProvider>
            <BusGrabber />
            <AdControlBar {...defaultProps} layout="default" isMuted />
          </EventBusProvider>
        );
      });
      // Before any audio action: enticement hides the real state → "sound on" icon.
      const iconBefore = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(iconBefore.getAttribute('src')).toContain('cxr/unmute.svg');

      // An audio action occurred (unmute on an earlier ad) — icon reflects reality.
      act(() => bus!.emit('mute:unmuted', {}));
      const iconAfter = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(iconAfter.getAttribute('src')).toContain('cxr/mute.svg');
    });

    it('a NEWLY-MOUNTED bar (next slot) reflects an audio action that happened before it mounted', () => {
      // Cross-slide regression: the user engages audio on slot 1 (→ `mute:unmuted`),
      // then swipes to slot 2, which mounts a FRESH AdControlBar. The enticement is
      // per-widget-instance, not per-slot: slot 2 must NOT re-show "sound on" — it
      // must reflect the real (muted) state, because the user already engaged audio.
      //
      // The provider stays mounted across the swipe (only the slide content swaps),
      // so the bus — and the engaged latch — must persist. A `showBar` toggle models
      // that: the provider mounts once, the event fires, THEN the bar appears.
      let bus: CxrEventBus | null = null;
      let setShowBar: ((v: boolean) => void) | null = null;
      function Harness(): React.JSX.Element {
        const [showBar, _setShowBar] = React.useState(false);
        setShowBar = _setShowBar;
        bus = useEventBus();
        return showBar ? <AdControlBar {...defaultProps} layout="default" isMuted /> : <span />;
      }
      act(() => {
        root.render(
          <EventBusProvider>
            <Harness />
          </EventBusProvider>
        );
      });
      // Slot 1 engaged audio earlier — the event fires while slot 2's bar is absent.
      act(() => bus!.emit('mute:unmuted', {}));
      // Now slot 2's bar mounts under the SAME (still-mounted) provider/bus.
      act(() => setShowBar!(true));

      const icon = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      // Must show the REAL muted icon, not the enticement that slot 1 already cleared.
      expect(icon.getAttribute('src')).toContain('cxr/mute.svg');
    });
  });
});
