import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { MuteUnmuteButton } from './MuteUnmuteButton';

vi.mock('@cxr/config', () => ({ assetLink: 'https://test.cdn/' }));

describe('MuteUnmuteButton', () => {
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

  it('renders mute icon when isMuted=true', () => {
    act(() => {
      root.render(<MuteUnmuteButton isMuted={true} onClick={() => undefined} />);
    });
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('mute.svg');
    expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Unmute');
  });

  it('renders unmute icon when isMuted=false', () => {
    act(() => {
      root.render(<MuteUnmuteButton isMuted={false} onClick={() => undefined} />);
    });
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('unmute.svg');
    expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Mute');
  });

  it('fires onClick when clicked', () => {
    const handler = vi.fn();
    act(() => {
      root.render(<MuteUnmuteButton isMuted={false} onClick={handler} />);
    });
    act(() => { container.querySelector('button')!.click(); });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('applies outline variant classes when variant=outline', () => {
    act(() => {
      root.render(<MuteUnmuteButton isMuted={false} onClick={() => undefined} variant="outline" />);
    });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('gencl:border-white');
  });

  it('applies cxr-animated-border class when animatedBorder=true', () => {
    act(() => {
      root.render(<MuteUnmuteButton isMuted={true} onClick={() => undefined} animatedBorder={true} />);
    });
    expect(container.querySelector('button')!.className).toContain('cxr-animated-border');
  });

  it('omits cxr-animated-border class when animatedBorder is not set', () => {
    act(() => {
      root.render(<MuteUnmuteButton isMuted={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('button')!.className).not.toContain('cxr-animated-border');
  });

  it('toggles cxr-animated-border class when animatedBorder changes true->false', () => {
    act(() => {
      root.render(<MuteUnmuteButton isMuted={true} onClick={() => undefined} animatedBorder={true} />);
    });
    expect(container.querySelector('button')!.className).toContain('cxr-animated-border');

    act(() => {
      root.render(<MuteUnmuteButton isMuted={true} onClick={() => undefined} animatedBorder={false} />);
    });
    expect(container.querySelector('button')!.className).not.toContain('cxr-animated-border');
  });
});
