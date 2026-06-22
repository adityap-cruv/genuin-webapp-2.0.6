import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { WatchButton } from './WatchButton';

vi.mock('@cxr/config', () => ({ assetLink: 'https://test.cdn/' }));

describe('WatchButton', () => {
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

  it('renders "Watch" label', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('button')!.textContent).toContain('Watch');
  });

  it('pill variant has rounded-full class', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} variant="pill" />);
    });
    expect(container.querySelector('button')!.className).toContain('gencl:rounded-full');
  });

  it('rect variant has rounded-lg class', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} variant="rect" />);
    });
    expect(container.querySelector('button')!.className).toContain('gencl:rounded-lg');
  });

  it('fullWidth=true adds w-full class', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} fullWidth />);
    });
    expect(container.querySelector('button')!.className).toContain('gencl:w-full');
  });

  it('fires onClick when clicked', () => {
    const handler = vi.fn();
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={handler} />);
    });
    act(() => {
      container.querySelector('button')!.click();
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('shows pause icon when isPlay=true', () => {
    act(() => {
      root.render(<WatchButton isPlay={true} onClick={() => undefined} />);
    });
    expect(container.querySelector('img')!.src).toContain('pause.svg');
  });

  it('shows play icon when isPlay=false', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('img')!.src).toContain('play.svg');
  });

  it('rect variant is the default', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('button')!.className).toContain('gencl:rounded-lg');
  });

  it('applies w-fit when fullWidth=false (default)', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('button')!.className).toContain('gencl:w-fit');
  });

  it('pulse=true adds the cxr-heartbeat class', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} pulse />);
    });
    expect(container.querySelector('button')!.className).toContain('cxr-heartbeat');
  });

  it('omits cxr-heartbeat class by default', () => {
    act(() => {
      root.render(<WatchButton isPlay={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('button')!.className).not.toContain('cxr-heartbeat');
  });
});
