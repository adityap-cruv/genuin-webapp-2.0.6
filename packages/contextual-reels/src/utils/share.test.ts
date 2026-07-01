/**
 * Tests for `share` utilities — clipboard copy with execCommand fallback and
 * the new-tab share-link opener.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard, openShareLink } from "@cxr/utils/share";

describe("copyToClipboard", () => {
  beforeEach(() => {
    // Keep the logger's console.warn fallback path quiet during assertions.
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Remove the `navigator.clipboard` override so each test starts clean.
    Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "clipboard");
  });

  it("is a no-op for empty text", async () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    await copyToClipboard("");

    expect(writeText).not.toHaveBeenCalled();
  });

  it("writes via the async Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    await copyToClipboard("hello");

    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to a textarea + execCommand when the Clipboard API rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
      writable: true,
    });

    await copyToClipboard("fallback-text");

    expect(execCommand).toHaveBeenCalledWith("copy");
    // The textarea must be cleaned up after the copy attempt.
    expect(document.querySelector("textarea")).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it("falls back to execCommand when the Clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
      writable: true,
    });

    await copyToClipboard("no-api-text");

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("removes the textarea even when execCommand throws", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    const execCommand = vi.fn().mockImplementation(() => {
      throw new Error("execCommand boom");
    });
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
      writable: true,
    });

    await copyToClipboard("throwing-text");

    // finally{} must still tear down the textarea on failure.
    expect(document.querySelector("textarea")).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});

describe("openShareLink", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is a no-op when the url is undefined", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    openShareLink(undefined);

    expect(open).not.toHaveBeenCalled();
  });

  it("is a no-op when the url is empty", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    openShareLink("");

    expect(open).not.toHaveBeenCalled();
  });

  it("opens the url in a new noopener tab", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    openShareLink("https://begenuin.com/profile");

    expect(open).toHaveBeenCalledWith("https://begenuin.com/profile", "_blank", "noopener,noreferrer");
  });
});
