import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PlayPauseButton } from './PlayPauseButton';

vi.mock('@cxr/config', () => ({ assetLink: 'https://test.cdn/' }));

describe('PlayPauseButton', () => {
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

  it('renders play icon when isPlay=false', () => {
    act(() => {
      root.render(<PlayPauseButton isPlay={false} onClick={() => undefined} />);
    });
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('play.svg');
    expect(img.alt).toBe('Play');
    expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Play');
  });

  it('renders pause icon when isPlay=true', () => {
    act(() => {
      root.render(<PlayPauseButton isPlay={true} onClick={() => undefined} />);
    });
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('pause.svg');
    expect(img.alt).toBe('Pause');
    expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Pause');
  });

  it('fires onClick when clicked', () => {
    const handler = vi.fn();
    act(() => {
      root.render(<PlayPauseButton isPlay={false} onClick={handler} />);
    });
    act(() => {
      container.querySelector('button')!.click();
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('applies ghost variant classes by default', () => {
    act(() => {
      root.render(<PlayPauseButton isPlay={false} onClick={() => undefined} />);
    });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('gencl:bg-[#00000066]');
  });

  it('applies solid variant classes when variant=solid', () => {
    act(() => {
      root.render(<PlayPauseButton isPlay={false} onClick={() => undefined} variant="solid" />);
    });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('gencl:bg-black');
  });

  it('uses sm icon size when size=sm', () => {
    act(() => {
      root.render(<PlayPauseButton isPlay={false} onClick={() => undefined} size="sm" />);
    });
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.style.width).toBe('14px');
  });
});
