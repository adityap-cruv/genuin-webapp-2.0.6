import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { resolvePageUrl, resolveAdUrlMacros, resolveVideoAdMacros } from './adUrlMacros';

// ─── resolveAdUrlMacros ───────────────────────────────────────────────────────

describe('resolveAdUrlMacros', () => {
  it('replaces [PAGE_URL] with the encoded page URL', () => {
    const url = 'https://ads.example.com/vast?site-url=[PAGE_URL]&stid=1';
    const result = resolveAdUrlMacros(url, 'https://publisher.com/article');
    expect(result).toBe(
      'https://ads.example.com/vast?site-url=https%3A%2F%2Fpublisher.com%2Farticle&stid=1'
    );
  });

  it('replaces multiple [PAGE_URL] occurrences', () => {
    const url = 'https://ads.example.com?url=[PAGE_URL]&ref=[PAGE_URL]';
    const result = resolveAdUrlMacros(url, 'https://publisher.com/');
    const encoded = encodeURIComponent('https://publisher.com/');
    expect(result).toBe(`https://ads.example.com?url=${encoded}&ref=${encoded}`);
  });

  it('returns the url unchanged when [PAGE_URL] is absent', () => {
    const url = 'https://ads.example.com/vast?stid=1';
    expect(resolveAdUrlMacros(url, 'https://publisher.com/')).toBe(url);
  });

  it('handles empty page URL', () => {
    const url = 'https://ads.example.com?url=[PAGE_URL]';
    expect(resolveAdUrlMacros(url, '')).toBe('https://ads.example.com?url=');
  });
});

// ─── resolveVideoAdMacros ─────────────────────────────────────────────────────

describe('resolveVideoAdMacros', () => {
  const PAGE = 'https://publisher.com/page';
  const ENCODED = encodeURIComponent(PAGE);

  it('resolves macros in a plain string', () => {
    expect(resolveVideoAdMacros('https://ads.com?u=[PAGE_URL]', PAGE)).toBe(
      `https://ads.com?u=${ENCODED}`
    );
  });

  it('resolves macros in object.url', () => {
    const result = resolveVideoAdMacros({ url: 'https://ads.com?u=[PAGE_URL]', platform: 'td' }, PAGE);
    expect((result as { url: string }).url).toBe(`https://ads.com?u=${ENCODED}`);
    expect((result as { platform: string }).platform).toBe('td');
  });

  it('resolves macros in object.ads_url', () => {
    const result = resolveVideoAdMacros({ ads_url: 'https://ads.com?u=[PAGE_URL]' }, PAGE);
    expect((result as { ads_url: string }).ads_url).toBe(`https://ads.com?u=${ENCODED}`);
  });

  it('resolves macros in object.vastUrl', () => {
    const result = resolveVideoAdMacros({ vastUrl: 'https://ads.com?u=[PAGE_URL]' }, PAGE);
    expect((result as { vastUrl: string }).vastUrl).toBe(`https://ads.com?u=${ENCODED}`);
  });

  it('resolves macros in each element of an array', () => {
    const input = [
      'https://a.com?u=[PAGE_URL]',
      { url: 'https://b.com?u=[PAGE_URL]' },
    ];
    const result = resolveVideoAdMacros(input, PAGE) as unknown[];
    expect(result[0]).toBe(`https://a.com?u=${ENCODED}`);
    expect((result[1] as { url: string }).url).toBe(`https://b.com?u=${ENCODED}`);
  });

  it('returns falsy values unchanged', () => {
    expect(resolveVideoAdMacros(undefined, PAGE)).toBeUndefined();
    expect(resolveVideoAdMacros(null, PAGE)).toBeNull();
  });

  it('returns non-string/object/array primitives unchanged', () => {
    expect(resolveVideoAdMacros(42, PAGE)).toBe(42);
  });

  it('does not mutate the original object', () => {
    const original = { url: 'https://ads.com?u=[PAGE_URL]' };
    resolveVideoAdMacros(original, PAGE);
    expect(original.url).toBe('https://ads.com?u=[PAGE_URL]');
  });
});

// ─── resolvePageUrl ───────────────────────────────────────────────────────────

describe('resolvePageUrl', () => {
  const originalWindow = global.window;

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore window.parent to same-window reference
    Object.defineProperty(global.window, 'parent', {
      value: global.window,
      writable: true,
      configurable: true,
    });
  });

  it('returns window.location.href when not in an iframe', () => {
    // window.parent === window (top-level)
    Object.defineProperty(global.window, 'parent', {
      value: global.window,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.window, 'location', {
      value: { href: 'https://publisher.com/page' },
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe('https://publisher.com/page');
  });

  it('returns parent location href when in same-origin iframe', () => {
    const parentWindow = {
      location: { href: 'https://publisher.com/embed-page' },
    };
    Object.defineProperty(global.window, 'parent', {
      value: parentWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.window, 'location', {
      value: { href: 'https://publisher.com/widget' },
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe('https://publisher.com/embed-page');
  });

  it('falls back to document.referrer when in cross-origin iframe', () => {
    const crossOriginParent = {
      get location(): never {
        throw new DOMException('Blocked', 'SecurityError');
      },
    };
    Object.defineProperty(global.window, 'parent', {
      value: crossOriginParent,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.document, 'referrer', {
      value: 'https://publisher.com/cross-origin-page',
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe('https://publisher.com/cross-origin-page');
  });

  it('falls back to window.location.href when cross-origin and no referrer', () => {
    const crossOriginParent = {
      get location(): never {
        throw new DOMException('Blocked', 'SecurityError');
      },
    };
    Object.defineProperty(global.window, 'parent', {
      value: crossOriginParent,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.document, 'referrer', {
      value: '',
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.window, 'location', {
      value: { href: 'https://cdn.example.com/widget.html' },
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe('https://cdn.example.com/widget.html');
  });
});
