import { describe, it, expect, vi, afterEach } from "vitest";

import { resolvePageUrl, resolveAdUrlMacros, resolveVideoAdMacros } from "./adUrlMacros";
import { HOST_URL_MACRO_TOKENS } from "./adUrlMacros";

// ─── resolveAdUrlMacros ───────────────────────────────────────────────────────

describe("resolveAdUrlMacros", () => {
  it("replaces [PAGE_URL] with the encoded page URL", () => {
    const url = "https://ads.example.com/vast?site-url=[PAGE_URL]&stid=1";
    const result = resolveAdUrlMacros(url, "https://publisher.com/article");
    expect(result).toBe("https://ads.example.com/vast?site-url=https%3A%2F%2Fpublisher.com%2Farticle&stid=1");
  });

  it("replaces multiple [PAGE_URL] occurrences", () => {
    const url = "https://ads.example.com?url=[PAGE_URL]&ref=[PAGE_URL]";
    const result = resolveAdUrlMacros(url, "https://publisher.com/");
    const encoded = encodeURIComponent("https://publisher.com/");
    expect(result).toBe(`https://ads.example.com?url=${encoded}&ref=${encoded}`);
  });

  it("returns the url unchanged when [PAGE_URL] is absent", () => {
    const url = "https://ads.example.com/vast?stid=1";
    expect(resolveAdUrlMacros(url, "https://publisher.com/")).toBe(url);
  });

  it("handles empty page URL", () => {
    const url = "https://ads.example.com?url=[PAGE_URL]";
    expect(resolveAdUrlMacros(url, "")).toBe("https://ads.example.com?url=");
  });
});

// ─── resolveVideoAdMacros ─────────────────────────────────────────────────────

describe("resolveVideoAdMacros", () => {
  const PAGE = "https://publisher.com/page";
  const ENCODED = encodeURIComponent(PAGE);

  it("resolves macros in a plain string", () => {
    expect(resolveVideoAdMacros("https://ads.com?u=[PAGE_URL]", PAGE)).toBe(`https://ads.com?u=${ENCODED}`);
  });

  it("resolves macros in object.url", () => {
    const result = resolveVideoAdMacros({ url: "https://ads.com?u=[PAGE_URL]", platform: "td" }, PAGE);
    expect((result as { url: string }).url).toBe(`https://ads.com?u=${ENCODED}`);
    expect((result as { platform: string }).platform).toBe("td");
  });

  it("resolves macros in object.ads_url", () => {
    const result = resolveVideoAdMacros({ ads_url: "https://ads.com?u=[PAGE_URL]" }, PAGE);
    expect((result as { ads_url: string }).ads_url).toBe(`https://ads.com?u=${ENCODED}`);
  });

  it("resolves macros in object.vastUrl", () => {
    const result = resolveVideoAdMacros({ vastUrl: "https://ads.com?u=[PAGE_URL]" }, PAGE);
    expect((result as { vastUrl: string }).vastUrl).toBe(`https://ads.com?u=${ENCODED}`);
  });

  it("resolves macros in each element of an array", () => {
    const input = ["https://a.com?u=[PAGE_URL]", { url: "https://b.com?u=[PAGE_URL]" }];
    const result = resolveVideoAdMacros(input, PAGE) as unknown[];
    expect(result[0]).toBe(`https://a.com?u=${ENCODED}`);
    expect((result[1] as { url: string }).url).toBe(`https://b.com?u=${ENCODED}`);
  });

  it("returns falsy values unchanged", () => {
    expect(resolveVideoAdMacros(undefined, PAGE)).toBeUndefined();
    expect(resolveVideoAdMacros(null, PAGE)).toBeNull();
  });

  it("returns non-string/object/array primitives unchanged", () => {
    expect(resolveVideoAdMacros(42, PAGE)).toBe(42);
  });

  it("does not mutate the original object", () => {
    const original = { url: "https://ads.com?u=[PAGE_URL]" };
    resolveVideoAdMacros(original, PAGE);
    expect(original.url).toBe("https://ads.com?u=[PAGE_URL]");
  });
});

// ─── resolvePageUrl ───────────────────────────────────────────────────────────

describe("resolvePageUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // Restore window.parent to same-window reference
    Object.defineProperty(global.window, "parent", {
      value: global.window,
      writable: true,
      configurable: true,
    });
  });

  it("returns window.location.href when not in an iframe", () => {
    // window.parent === window (top-level)
    Object.defineProperty(global.window, "parent", {
      value: global.window,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.window, "location", {
      value: { href: "https://publisher.com/page" },
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe("https://publisher.com/page");
  });

  it("returns parent location href when in same-origin iframe", () => {
    const parentWindow = {
      location: { href: "https://publisher.com/embed-page" },
    };
    Object.defineProperty(global.window, "parent", {
      value: parentWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.window, "location", {
      value: { href: "https://publisher.com/widget" },
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe("https://publisher.com/embed-page");
  });

  it("falls back to document.referrer when in cross-origin iframe", () => {
    const crossOriginParent = {
      get location(): never {
        throw new DOMException("Blocked", "SecurityError");
      },
    };
    Object.defineProperty(global.window, "parent", {
      value: crossOriginParent,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.document, "referrer", {
      value: "https://publisher.com/cross-origin-page",
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe("https://publisher.com/cross-origin-page");
  });

  it("falls back to window.location.href when cross-origin and no referrer", () => {
    const crossOriginParent = {
      get location(): never {
        throw new DOMException("Blocked", "SecurityError");
      },
    };
    Object.defineProperty(global.window, "parent", {
      value: crossOriginParent,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.document, "referrer", {
      value: "",
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.window, "location", {
      value: { href: "https://cdn.example.com/widget.html" },
      writable: true,
      configurable: true,
    });
    expect(resolvePageUrl()).toBe("https://cdn.example.com/widget.html");
  });

  it("returns an empty string when window is undefined (server-side rendering)", () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    try {
      expect(resolvePageUrl()).toBe("");
    } finally {
      Object.defineProperty(globalThis, "window", {
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
    expect(result).toBe(`https://ads.example.com?u=${encodeURIComponent("https://p.com/a")}&gdpr=1`);
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
    const result = resolveVideoAdMacros({ url: "https://ads.com?gdpr=[GDPR]" }, "https://p.com/a", MACROS);
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
    const result = resolveVideoAdMacros({ url: rawUrl, platform: "tritondigital" }, "https://p.com", MACROS) as {
      url: string;
    };
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

  it("appends dist=<appb> when the url has no existing dist param (else branch)", () => {
    // No `dist` param at all, and no `site-url` either — exercises the `dist`
    // absent branch (appends rather than replaces) while still having a `?`
    // in the url already, so the `dist` append itself uses the `&` separator.
    const result = resolveVideoAdMacros(
      { url: "https://t.co/ars?stid=1446814&type=midroll", platform: "tritondigital" },
      "https://page.com",
      { appb: "com.x.y" }
    ) as { url: string };
    const u = new URL(result.url);
    expect(u.searchParams.get("dist")).toBe("com.x.y");
    expect(u.searchParams.get("bundle-id")).toBe("com.x.y");
    expect(u.searchParams.get("stid")).toBe("1446814");
  });

  it("appends dist=<appb> with a leading '?' when the url has no query string at all", () => {
    // No `?` anywhere in the url — exercises BOTH the `dist`-append `?`
    // branch (line 93) and the app-params `?` branch (line 100) taking the
    // "no existing query string" path instead of "&".
    const result = resolveVideoAdMacros({ url: "https://t.co/ars", platform: "tritondigital" }, "https://page.com", {
      appb: "com.x.y",
    }) as { url: string };
    expect(result.url).toBe("https://t.co/ars?dist=com.x.y&bundle-id=com.x.y");
  });

  it("collapses a site-url sitting between two params back to a single '&' separator", () => {
    // site-url flanked by params on both sides — both the leading and
    // trailing `&` match in the regex, exercising the collapse-to-single-`&`
    // branch (branch 85's true/true arm) rather than the drop-entirely arm.
    const result = resolveVideoAdMacros(
      {
        url: "https://t.co/ars?a=1&site-url=https%3A%2F%2Fp.com&dist=https%3A%2F%2Fp.com&b=2",
        platform: "tritondigital",
      },
      "https://page.com",
      { appb: "com.x.y" }
    ) as { url: string };
    expect(result.url).not.toContain("site-url");
    expect(result.url).not.toContain("&&");
    expect(result.url).not.toContain("?&");
    expect(result.url).toContain("a=1&dist=com.x.y&b=2");
  });
});

// ─── resolveVideoAdMacros — servedStatically rewrite ──────────────────────────────

describe("resolveVideoAdMacros — servedStatically rewrite", () => {
  const PAGE = "https://publisher.com/article";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replaces the ua param with the real navigator.userAgent", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("RealUA/1.0 (Test)");
    const url = "https://ads.com/x?stid=1&ua=Mozilla/5.0%20Fake&type=midroll";
    const result = resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: true }) as string;
    expect(result).toContain(`ua=${encodeURIComponent("RealUA/1.0 (Test)")}`);
    expect(result).not.toContain("Fake");
  });

  it("falls back to an empty ua when navigator.userAgent is absent", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(undefined as unknown as string);
    const url = "https://ads.com/x?ua=Mozilla/5.0%20Fake&type=midroll";
    const result = resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: true }) as string;
    expect(result).toContain("ua=&type=midroll");
    expect(result).not.toContain("Fake");
  });

  it("replaces the ip param value with the real client IP", () => {
    const url = "https://ads.com/x?stid=1&ip=106.203.213.228&type=midroll";
    const result = resolveVideoAdMacros(url, PAGE, undefined, {
      servedStatically: true,
      clientIp: "8.8.4.4",
    }) as string;
    expect(result).toBe("https://ads.com/x?stid=1&ip=8.8.4.4&type=midroll");
    expect(result).not.toContain("106.203.213.228");
  });

  it("strips the ip param when no clientIp is available (best-effort fallback)", () => {
    const url = "https://ads.com/x?stid=1&ip=106.203.213.228&type=midroll";
    const result = resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: true }) as string;
    expect(result).not.toContain("ip=");
    expect(result).not.toContain("&&");
    expect(result).not.toContain("?&");
    expect(result).toBe("https://ads.com/x?stid=1&type=midroll");
  });

  it("strips a trailing ip param (no clientIp) without leaving a dangling &", () => {
    const url = "https://ads.com/x?stid=1&ip=1.2.3.4";
    const result = resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: true }) as string;
    expect(result).toBe("https://ads.com/x?stid=1");
  });

  it("strips only the real ip param, never a param whose name merely ends in 'ip'", () => {
    // Regression: the strip must anchor on a `[?&]` param boundary. `myip`/`skip`
    // end in "ip" but are unrelated params and must survive untouched.
    const url = "https://ads.com/x?myip=9.9.9.9&skip=yes&ip=106.203.213.228&b=2";
    const result = resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: true }) as string;
    expect(result).toBe("https://ads.com/x?myip=9.9.9.9&skip=yes&b=2");
  });

  it("does not corrupt an unrelated param ending in 'ip' when it precedes the real ip", () => {
    // Regression for the old unanchored regex, which turned `?skip=yes&ip=X` into
    // `?skip=X` (mangled the wrong param and left the fake ip in place).
    const url = "https://ads.com/x?skip=yes&ip=1.1.1.1";
    const result = resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: true }) as string;
    expect(result).toBe("https://ads.com/x?skip=yes");
  });

  it("replaces only the real ua param, never a param whose name ends in 'ua'", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("RealUA/1.0");
    const url = "https://ads.com/x?lingua=fr&ua=Fake&b=2";
    const result = resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: true }) as string;
    expect(result).toBe(`https://ads.com/x?lingua=fr&ua=${encodeURIComponent("RealUA/1.0")}&b=2`);
  });

  it("still resolves [PAGE_URL] under servedStatically and replaces ip", () => {
    const url = "https://ads.com/x?site-url=[PAGE_URL]&ip=1.2.3.4";
    const result = resolveVideoAdMacros(url, PAGE, undefined, {
      servedStatically: true,
      clientIp: "9.9.9.9",
    }) as string;
    expect(result).toContain(`site-url=${encodeURIComponent(PAGE)}`);
    expect(result).toContain("ip=9.9.9.9");
  });

  it("regression: without servedStatically the URL is byte-identical to today", () => {
    const url = "https://ads.com/x?stid=1&ip=106.203.213.228&ua=Mozilla/5.0%20Fake&type=midroll";
    expect(resolveVideoAdMacros(url, PAGE)).toBe(url);
    expect(resolveVideoAdMacros(url, PAGE, undefined, { servedStatically: false })).toBe(url);
  });
});
