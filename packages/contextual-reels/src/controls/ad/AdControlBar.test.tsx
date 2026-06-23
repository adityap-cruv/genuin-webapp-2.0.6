import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AdControlBar } from './AdControlBar';
import {
  UserInteractionProvider,
  useMarkUserInteracted,
} from '@cxr/instance/coordination/UserInteractionTracker';

vi.mock('@cxr/config', () => ({ assetLink: 'https://test.cdn/' }));

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

    it('shows the real mute icon after the user has interacted (system mute on a later ad)', () => {
      // Simulates: user unmuted an earlier ad (interaction persists per-instance),
      // then a SYSTEM mute on the next ad sets isMuted=true. Without taps on this
      // bar the icon must still reveal the muted state, not stay on "sound on".
      let mark: (() => void) | null = null;
      function Marker(): React.JSX.Element {
        mark = useMarkUserInteracted();
        return <span />;
      }
      act(() => {
        root.render(
          <UserInteractionProvider>
            <Marker />
            <AdControlBar {...defaultProps} layout="default" isMuted />
          </UserInteractionProvider>
        );
      });
      // Before interaction: enticement hides the real state → "sound on" icon.
      const iconBefore = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(iconBefore.getAttribute('src')).toContain('cxr/unmute.svg');

      // After interaction: icon reflects the real (muted) state.
      act(() => mark!());
      const iconAfter = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(iconAfter.getAttribute('src')).toContain('cxr/mute.svg');
    });
  });
});
