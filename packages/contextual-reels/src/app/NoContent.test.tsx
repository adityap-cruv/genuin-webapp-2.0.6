/**
 * Tests for `src/app/NoContent.tsx`.
 *
 * NoContent is a pure presentational leaf. Rendered with raw React + react-dom
 * (this repo does NOT use @testing-library/react) per the cluster conventions.
 */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { NoContent } from "@cxr/app/NoContent";

describe("NoContent", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders the supplied message inside the no-content node", () => {
    act(() => {
      root.render(createElement(NoContent, { message: "Nothing here" }));
    });

    const node = container.querySelector('[data-testid="cxr-no-content"]');
    expect(node).toBeTruthy();
    expect(node?.textContent).toBe("Nothing here");
  });

  it("applies the dark placeholder styling", () => {
    act(() => {
      root.render(createElement(NoContent, { message: "Empty" }));
    });

    const node = container.querySelector<HTMLDivElement>('[data-testid="cxr-no-content"]');
    expect(node?.style.background).toBe("rgb(17, 17, 17)");
    expect(node?.style.fontSize).toBe("11px");
  });
});
