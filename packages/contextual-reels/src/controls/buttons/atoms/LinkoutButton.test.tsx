import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { LinkoutButton } from './LinkoutButton';

describe('LinkoutButton', () => {
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

  it('renders as an anchor with correct href', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    const anchor = container.querySelector('a')!;
    expect(anchor.href).toBe('https://example.com/');
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toContain('noopener');
  });

  it('shows caption text', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Shop Now" />);
    });
    expect(container.querySelector('a')!.textContent).toContain('Shop Now');
  });

  it('renders brand logo when logoUrl provided', () => {
    act(() => {
      root.render(
        <LinkoutButton
          href="https://example.com"
          caption="Order Now"
          logoUrl="https://logo.png"
        />,
      );
    });
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('hides logo when logoUrl not provided', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    expect(container.querySelector('img')).toBeNull();
  });

  it('has data-testid="linkout-btn"', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    expect(container.querySelector('[data-testid="linkout-btn"]')).not.toBeNull();
  });

  it('stops click propagation on the anchor', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    const anchor = container.querySelector('a')!;
    const event = new MouseEvent('click', { bubbles: true });
    const spy = vi.spyOn(event, 'stopPropagation');
    anchor.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });

  // Covers the `onClick?.()` truthy branch: when an onClick is supplied it must
  // fire alongside the default href navigation.
  it('invokes the supplied onClick handler on click', () => {
    const handler = vi.fn();
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" onClick={handler} />);
    });
    act(() => {
      container.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handler).toHaveBeenCalledOnce();
  });
});
