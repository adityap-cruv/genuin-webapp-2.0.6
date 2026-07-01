import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ExpandCollapseButton } from './ExpandCollapseButton';

vi.mock('@cxr/config', () => ({ assetLink: 'https://test.cdn/' }));

describe('ExpandCollapseButton', () => {
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

  it('renders shrink icon and testid=topbar-collapse when isFullScreen=true', () => {
    act(() => {
      root.render(<ExpandCollapseButton isFullScreen={true} onClick={() => undefined} />);
    });
    expect(container.querySelector('img')!.src).toContain('shrink.svg');
    expect(container.querySelector('[data-testid="topbar-collapse"]')).not.toBeNull();
    expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Collapse');
  });

  it('renders expand icon and testid=topbar-expand when isFullScreen=false', () => {
    act(() => {
      root.render(<ExpandCollapseButton isFullScreen={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('img')!.src).toContain('expand.svg');
    expect(container.querySelector('[data-testid="topbar-expand"]')).not.toBeNull();
    expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Expand');
  });

  it('fires onClick when clicked', () => {
    const handler = vi.fn();
    act(() => {
      root.render(<ExpandCollapseButton isFullScreen={false} onClick={handler} />);
    });
    act(() => { container.querySelector('button')!.click(); });
    expect(handler).toHaveBeenCalledOnce();
  });

  // Covers the optional `onClick?.()` branch: clicking without a handler must
  // not throw (the `?.` short-circuits when onClick is undefined).
  it('clicking with no onClick handler is a safe no-op', () => {
    act(() => {
      // onClick is typed required, but the component calls it as `onClick?.()`;
      // omit it via cast to exercise that defensive optional-call branch.
      root.render(<ExpandCollapseButton isFullScreen={false} {...({} as { onClick: () => void })} />);
    });
    expect(() => {
      act(() => { container.querySelector('button')!.click(); });
    }).not.toThrow();
  });

  // Covers the non-ghost branch of the className ternary (no GHOST_SHELL_CLASSES
  // appended): the solid variant must not carry the ghost shell background.
  it('applies solid variant classes without the ghost shell when variant=solid', () => {
    act(() => {
      root.render(<ExpandCollapseButton isFullScreen={false} onClick={() => undefined} variant="solid" />);
    });
    const btn = container.querySelector('button')!;
    expect(btn.className).not.toContain('gencl:bg-[#00000066]');
  });
});
