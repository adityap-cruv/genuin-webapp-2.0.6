import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { LinkoutButton } from "./LinkoutButton";

describe("LinkoutButton", () => {
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

  it("renders as an anchor with correct href", () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    const anchor = container.querySelector("a")!;
    expect(anchor.href).toBe("https://example.com/");
    expect(anchor.target).toBe("_blank");
    expect(anchor.rel).toContain("noopener");
  });

  it("neutralizes a javascript: href to # (XSS guard)", () => {
    act(() => {
      root.render(<LinkoutButton href="javascript:alert(1)" caption="Order Now" />);
    });
    const anchor = container.querySelector("a")!;
    // href resolves to the page URL + "#", never the javascript: scheme.
    expect(anchor.getAttribute("href")).toBe("#");
    expect(anchor.protocol).not.toBe("javascript:");
  });

  it("shows caption text", () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Shop Now" />);
    });
    expect(container.querySelector("a")!.textContent).toContain("Shop Now");
  });

  it("renders brand logo when logoUrl provided", () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" logoUrl="https://logo.png" />);
    });
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("hides logo when logoUrl not provided", () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    expect(container.querySelector("img")).toBeNull();
  });

  it('has data-testid="linkout-btn"', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    expect(container.querySelector('[data-testid="linkout-btn"]')).not.toBeNull();
  });

  it("stops click propagation on the anchor", () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" />);
    });
    const anchor = container.querySelector("a")!;
    const event = new MouseEvent("click", { bubbles: true });
    const spy = vi.spyOn(event, "stopPropagation");
    anchor.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });

  // Covers the `onClick?.()` truthy branch: when an onClick is supplied it must
  // fire alongside the default href navigation.
  it("invokes the supplied onClick handler on click", () => {
    const handler = vi.fn();
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" onClick={handler} />);
    });
    act(() => {
      container.querySelector("a")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it("defaults to the md size (24px logo)", () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Order Now" logoUrl="https://logo.png" />);
    });
    expect((container.querySelector("img") as HTMLImageElement).style.width).toBe("24px");
  });

  it('renders the sm size (18px logo, smaller caption/chevron) when size="sm"', () => {
    act(() => {
      root.render(
        <LinkoutButton href="https://example.com" caption="Order Now" logoUrl="https://logo.png" size="sm" />
      );
    });
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.style.width).toBe("18px");
    const caption = container.querySelector("span")!;
    expect(caption.className).toContain("text-[11px]");
  });

  it('renders caption-only (no logo, no chevron) and caps width when size="xs"', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Shop Now" logoUrl="https://logo.png" size="xs" />);
    });
    const anchor = container.querySelector("a")!;
    expect(anchor.textContent).toContain("Shop Now");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
    expect(anchor.className).toContain("max-w-17.5");
  });

  it('ignores logoUrl entirely when size="xs" even without an explicit logoUrl', () => {
    act(() => {
      root.render(<LinkoutButton href="https://example.com" caption="Shop Now" size="xs" />);
    });
    expect(container.querySelector("img")).toBeNull();
  });
});
