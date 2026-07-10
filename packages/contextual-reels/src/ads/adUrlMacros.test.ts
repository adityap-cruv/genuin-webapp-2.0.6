import { describe, it, expect, vi, afterEach } from 'vitest';

import { resolvePageUrl, resolveAdUrlMacros, resolveVideoAdMacros } from './adUrlMacros';
import { HOST_URL_MACRO_TOKENS } from './adUrlMacros';

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

  it('returns an empty string when window is undefined (server-side rendering)', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    try {
      expect(resolvePageUrl()).toBe('');
    } finally {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    }
  });
});

// ─── resolveAdUrlMacros — host macro tokens ───────────────────────────────────

describe("resolveAdUrlMacros — host macro tokens", () => {
  const MACROS = {
    dnt: "0",
    gdpr: "1",
    gdpr_consent: "CONSENT123",
    loclat: "40.77",
    loclong: "-73.95",
    appb: "com.x.y",
    appsi: "999",
    appsu: "https://play.google.com/store/apps/details?id=com.x.y",
  };

  it("substitutes a host token with the URL-encoded macro value", () => {
    const url = "https://ads.example.com/vast?gdpr=[GDPR]&c=[GDPRCONSENT]";
    const result = resolveAdUrlMacros(url, "https://p.com/a", MACROS);
    expect(result).toBe("https://ads.example.com/vast?gdpr=1&c=CONSENT123");
  });

  it("substitutes multiple occurrences of the same token", () => {
    const url = "https://ads.example.com?a=[DNT]&b=[DNT]";
    const result = resolveAdUrlMacros(url, "", MACROS);
    expect(result).toBe("https://ads.example.com?a=0&b=0");
  });

  it("leaves a token whose macro is absent untouched", () => {
    const url = "https://ads.example.com?lat=[LOCATION_LAT]";
    // MACROS without `loclat`, so the [LOCATION_LAT] token has no value to fill.
    const withoutLat = { dnt: MACROS.dnt, gdpr: MACROS.gdpr, gdpr_consent: MACROS.gdpr_consent };
    const result = resolveAdUrlMacros(url, "", withoutLat);
    expect(result).toBe("https://ads.example.com?lat=[LOCATION_LAT]");
  });

  it("resolves [PAGE_URL] and host tokens together", () => {
    const url = "https://ads.example.com?u=[PAGE_URL]&gdpr=[GDPR]";
    const result = resolveAdUrlMacros(url, "https://p.com/a", MACROS);
    expect(result).toBe(
      `https://ads.example.com?u=${encodeURIComponent("https://p.com/a")}&gdpr=1`
    );
  });

  it("exposes the documented token map keyed by ad-URL token", () => {
    expect(HOST_URL_MACRO_TOKENS["[DNT]"]).toBe("dnt");
    expect(HOST_URL_MACRO_TOKENS["[GDPR]"]).toBe("gdpr");
  });

  it("substitutes Triton app tokens (bundle/store id/store url encoded)", () => {
    const url = "https://t.co?bundle-id=[APP_BUNDLE]&store-id=[STORE_ID]&store-url=[STORE_URL]";
    const result = resolveAdUrlMacros(url, "", MACROS);
    expect(result).toBe(
      `https://t.co?bundle-id=com.x.y&store-id=999&store-url=${encodeURIComponent("https://play.google.com/store/apps/details?id=com.x.y")}`
    );
  });

  it("exposes the app tokens in the map", () => {
    expect(HOST_URL_MACRO_TOKENS["[APP_BUNDLE]"]).toBe("appb");
    expect(HOST_URL_MACRO_TOKENS["[STORE_ID]"]).toBe("appsi");
    expect(HOST_URL_MACRO_TOKENS["[STORE_URL]"]).toBe("appsu");
  });

  it("forwards host macros through resolveVideoAdMacros object.url", () => {
    const result = resolveVideoAdMacros(
      { url: "https://ads.com?gdpr=[GDPR]" },
      "https://p.com/a",
      MACROS
    );
    expect((result as { url: string }).url).toBe("https://ads.com?gdpr=1");
  });
});

// ─── resolveVideoAdMacros — Triton in-app rewrite ─────────────────────────────

describe("resolveVideoAdMacros — Triton in-app rewrite", () => {
  // Gate: rewrite fires when host macros carry an app bundle (appb) — the signal
  // that we are running inside an app webview — not on any per-tag allowlist.
  const MACROS = {
    appb: "com.handcent.app.nextsms",
    appsi: "315697",
    appsu: "https://play.google.com/store/apps/details?id=com.handcent.app.nextsms",
  };
  const tritonUrl =
    "https://cmod-na.live.streamtheworld.com/ondemand/ars?site-url=[PAGE_URL]&dist=[PAGE_URL]&stid=1446814&type=midroll";

  it("rewrites a Triton url when appb present: drops site-url, dist=appb, adds app params", () => {
    const result = resolveVideoAdMacros(
      { url: tritonUrl, ads_url: tritonUrl, platform: "tritondigital" },
      "https://page.com",
      MACROS
    ) as { url: string; ads_url: string };
    const u = new URL(result.url);
    expect(u.searchParams.has("site-url")).toBe(false);
    expect(u.searchParams.get("dist")).toBe("com.handcent.app.nextsms");
    expect(u.searchParams.get("bundle-id")).toBe("com.handcent.app.nextsms");
    expect(u.searchParams.get("store-id")).toBe("315697");
    expect(u.searchParams.get("store-url")).toBe(
      "https://play.google.com/store/apps/details?id=com.handcent.app.nextsms"
    );
    // stid/type preserved
    expect(u.searchParams.get("stid")).toBe("1446814");
    expect(u.searchParams.get("type")).toBe("midroll");
    // ads_url rewritten too
    expect(new URL(result.ads_url).searchParams.has("site-url")).toBe(false);
    // raw string must be percent-encoded exactly once (no %2520)
    expect(result.url).not.toContain("%25");
  });

  it("preserves original encoding of untouched params (ua/ttag) and drops site-url", () => {
    const rawUrl =
      "https://cmod-na.live.streamtheworld.com/ondemand/ars?site-url=https%3A%2F%2Fp.com&dist=https%3A%2F%2Fp.com&stid=1446814&ua=Mozilla/5.0%20(iPhone;%20CPU%20iPhone%20OS%2018_5)&ttag=brand_id:3252&type=midroll";
    const result = resolveVideoAdMacros(
      { url: rawUrl, platform: "tritondigital" },
      "https://p.com",
      MACROS
    ) as { url: string };
    // untouched params keep exact bytes
    expect(result.url).toContain("ua=Mozilla/5.0%20(iPhone;%20CPU%20iPhone%20OS%2018_5)");
    expect(result.url).toContain("ttag=brand_id:3252");
    expect(result.url).toContain("type=midroll");
    // site-url gone
    expect(result.url).not.toContain("site-url=");
    // dist now appb, app params appended (appb has no reserved chars)
    expect(result.url).toContain("dist=com.handcent.app.nextsms");
    expect(result.url).toContain("bundle-id=com.handcent.app.nextsms");
    expect(result.url).toContain("store-id=315697");
    expect(result.url).toContain(
      "store-url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.handcent.app.nextsms"
    );
  });

  it("removes site-url when it is the first param, leaving no ?& artifact", () => {
    const result = resolveVideoAdMacros(
      {
        url: "https://t.co/ars?site-url=https%3A%2F%2Fp.com&dist=https%3A%2F%2Fp.com&stid=1",
        platform: "tritondigital",
      },
      "https://p.com",
      { appb: "com.x.y" }
    ) as { url: string };
    expect(result.url).not.toContain("site-url");
    expect(result.url).not.toContain("?&");
    expect(result.url).not.toContain("&&");
    expect(result.url).toContain("dist=com.x.y");
  });

  it("leaves Triton url unchanged when no appb (web load, not in-app)", () => {
    const result = resolveVideoAdMacros(
      { url: tritonUrl, platform: "tritondigital" },
      "https://page.com",
      {} // no host macros → not an app webview
    ) as { url: string };
    const u = new URL(result.url);
    // site-url present (as resolved page url), no app params
    expect(u.searchParams.get("site-url")).toBe("https://page.com");
    expect(u.searchParams.has("bundle-id")).toBe(false);
    expect(u.searchParams.get("dist")).toBe("https://page.com");
  });

  it("leaves a NON-triton url unchanged even when appb present", () => {
    const result = resolveVideoAdMacros(
      { url: "https://other.com?site-url=[PAGE_URL]", platform: "infy" },
      "https://page.com",
      MACROS
    ) as { url: string };
    expect(new URL(result.url).searchParams.get("site-url")).toBe("https://page.com");
  });

  it("leaves dist unchanged and skips app params when appb macro is absent", () => {
    const result = resolveVideoAdMacros(
      { url: tritonUrl, platform: "tritondigital" },
      "https://page.com",
      { appsi: "315697" } // appsi but no appb → gate does not fire
    ) as { url: string };
    const u = new URL(result.url);
    expect(u.searchParams.get("dist")).toBe("https://page.com"); // unchanged (appb absent)
    expect(u.searchParams.has("bundle-id")).toBe(false);
  });
});
