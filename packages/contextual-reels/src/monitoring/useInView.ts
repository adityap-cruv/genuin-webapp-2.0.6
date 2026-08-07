/**
 * useInView — reports whether an element currently intersects the viewport AND
 * isn't CSS-hidden, via a callback ref the caller attaches to the element.
 *
 * A thin `IntersectionObserver` wrapper with no CXR domain knowledge: it answers
 * one question ("is this box actually visible?") and leaves every policy
 * decision to the caller. {@link useFeedVisibilityGate} is the caller that turns
 * this into render/passback/teardown behaviour.
 *
 * **Callback ref, not a `RefObject`.** A `RefObject` read inside `useEffect`
 * only re-runs when the ref *object's identity* changes, which never happens —
 * mutating `.current` doesn't trigger a re-render. That leaves the observer
 * unable to attach to an element that mounts after this hook's own first
 * effect, or that gets replaced. A callback ref fires on every attach/detach,
 * so the observer (re)wires itself correctly regardless of when or how many
 * times the target element changes.
 *
 * **`isIntersecting` alone isn't "visible".** A host that hides the slot with
 * `visibility: hidden` keeps its layout box intact — the box still
 * geometrically intersects the viewport, so `isIntersecting` stays `true` even
 * though nothing is painted. This hook additionally checks the element's
 * computed `visibility` on every callback so that case reports `false` too.
 * `display: none` doesn't need the same check — it removes the box from layout
 * entirely, so `isIntersecting` already goes `false` on its own.
 *
 * **Fails open.** A runtime without `IntersectionObserver`, a ref that never
 * attaches, or an `observe()` that throws on a detached node all resolve to
 * `true`. Callers gate revenue on this value, so a missing observer must
 * degrade to "visible" — never to "hidden".
 *
 * Inside an iframe the implicit root clips through ancestor frames per the
 * IntersectionObserver spec, so a cross-origin embed scrolled below the host
 * page's fold does report `false`. That is the same mechanism ad-viewability
 * libraries rely on.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Options for {@link useInView}. */
export interface UseInViewOptions {
  /**
   * Intersection ratio at which the element counts as in view. Defaults to `0` —
   * any intersecting pixel.
   */
  threshold?: number;
  /**
   * When `false`, never creates an observer regardless of whether an element
   * attaches — the hook immediately reports `true` (fail-open) and stays there.
   * Defaults to `true`. Use this instead of conditionally attaching the ref, so
   * the caller's element can always render unconditionally.
   */
  enabled?: boolean;
}

/**
 * How the current {@link UseInViewResult.isVisible} value was arrived at — so a
 * consumer can tell a REAL reading apart from a fail-open one. Critical when the
 * value feeds analytics: a fail-open `true` must never be counted as a measured
 * visible unit, or the aggregate visibility rate skews high.
 *
 *  - `"measured"`    — the observer delivered a genuine intersection callback.
 *  - `"unsupported"` — no `IntersectionObserver` in this runtime; failed open to `true`.
 *  - `"error"`       — `observe()` threw (e.g. detached node); failed open to `true`.
 *  - `"pending"`     — observer attached, first callback not yet delivered (`isVisible` still `null`).
 */
export type VisibilitySource = "measured" | "unsupported" | "error" | "pending";

/** Return value of {@link useInView}. */
export interface UseInViewResult {
  /**
   * Callback ref — attach to the element to observe. Safe to attach to an
   * element that mounts later or gets replaced; the observer re-wires itself.
   */
  ref: (element: HTMLElement | null) => void;
  /**
   * `null` before the observer has delivered its first callback (or while
   * `enabled` is `false` and no fail-open has resolved yet), then `true`/`false`
   * for each intersection-and-visibility change. Always `true` when the
   * observer could not be attached or is disabled (see the fail-open note
   * above). Pair with {@link source} to distinguish a measured `true` from a
   * fail-open `true`.
   */
  isVisible: boolean | null;
  /**
   * Provenance of the current `isVisible` value — see {@link VisibilitySource}.
   * Lets a consumer exclude fail-open (`"unsupported"`/`"error"`) readings from
   * any rate that must reflect real measurement.
   */
  source: VisibilitySource;
  /**
   * Whether the observer's root is **cross-origin** to the observed element, per
   * the `IntersectionObserverEntry.rootBounds === null` security nulling: the
   * browser withholds `rootBounds` exactly when the target is in a frame whose
   * root is cross-origin. `null` until the first real callback (or on a
   * fail-open, where nothing was measured).
   *
   * Reported so a visibility rate can be segmented by frame context — a
   * cross-origin embed (the dominant path) is where `IntersectionObserver`'s
   * cross-frame behaviour is most fragile, so its `measured` readings deserve
   * separate scrutiny from same-origin/top-frame ones. It does NOT change
   * `isVisible` or `source`; it's a diagnostic dimension only.
   */
  crossOriginRoot: boolean | null;
  /**
   * **Consolidated visibility verdict** — `isVisible` (IO v1 ∧ CSS visible)
   * tightened with the signal the `VISIBILITY_DIAGNOSTIC` beacon confirmed
   * catches a natively-hidden WebView that IO v1 alone reports as visible:
   *
   *  - IO v2 (`trackVisibility`) `entry.isVisible === false` where supported, or
   *  - a geometry fallback (less than half the rect's area on-screen, or a zero
   *    inner viewport) where IO v2 is unsupported.
   *
   * **Measurement-only.** This is an ADDITIONAL field, not a replacement for
   * `isVisible`; the revenue gate still reads `isVisible`. It exists so the
   * field data can compare a consolidated verdict against today's `unit_visible`
   * and settle whether/what to fold into the gate later — see
   * [VISIBILITY_DIAGNOSTIC_FINDINGS.md]. Same lifecycle as `isVisible`: `null`
   * until measured, and fail-open `true` when no observer could attach.
   */
  trulyVisible: boolean | null;
}

/** Whether `element`'s computed `visibility` isn't `hidden`. Defaults open on error. */
function isCssVisible(element: Element): boolean {
  try {
    return window.getComputedStyle(element).visibility !== "hidden";
  } catch {
    return true;
  }
}

/** Whether this runtime exposes IO v2 (`IntersectionObserverEntry.isVisible`). */
function isIoV2Supported(): boolean {
  try {
    const proto = window.IntersectionObserverEntry?.prototype;
    return !!proto && "isVisible" in proto;
  } catch {
    return false;
  }
}

/**
 * Geometry fallback for the {@link UseInViewResult.trulyVisible} verdict when IO
 * v2 is unsupported: is the element's box actually on-screen? Mirrors the two
 * signals the `VISIBILITY_DIAGNOSTIC` beacon saw flip on the field repro — a
 * rect centre pushed off-screen (`rect_x/y = -160/-240` on a 320×480 box) and a
 * zero inner viewport (`viewport_inner_* = 0`). **Fails open** (`true`) on any
 * read error, matching the hook's revenue-safe contract.
 */
function isGeometryOnScreen(element: Element): boolean {
  try {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // A zero (or unreadable) inner viewport is never a genuinely-visible state.
    if (!w || !h) return false;
    const r = element.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    // Require the MAJORITY of the element's area to fall inside the viewport,
    // not mere any-pixel overlap. The field repro kept a positive-area 320×480
    // rect while shoving it to x/y = -160/-240 — exactly half off each axis, so
    // only a quarter of its area is on-screen. Any-overlap (or a centre-point
    // test, whose centre lands on the (0,0) corner there) still reads "visible";
    // an area-majority test flips it to hidden.
    const visibleW = Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0));
    const visibleH = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
    const visibleFraction = (visibleW * visibleH) / (r.width * r.height);
    return visibleFraction > 0.5;
  } catch {
    return true;
  }
}

/**
 * Observe an element (via the returned callback ref) and report its combined
 * viewport intersection + CSS visibility. See the module doc comment for the
 * full rationale.
 *
 * @param options  See {@link UseInViewOptions}.
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useInView();
 * return <div ref={ref} />;
 * ```
 */
export function useInView(options?: UseInViewOptions): UseInViewResult {
  const threshold = options?.threshold ?? 0;
  const enabled = options?.enabled ?? true;

  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  // Provenance of `isVisible`, so a fail-open `true` is never mistaken for a
  // measured one. Starts "pending" (attached-but-unmeasured) and only becomes
  // "measured" on a real callback.
  const [source, setSource] = useState<VisibilitySource>("pending");
  // Cross-origin-root diagnostic: `rootBounds === null` on a real entry means the
  // observed element is in a frame cross-origin to the root. `null` until measured.
  const [crossOriginRoot, setCrossOriginRoot] = useState<boolean | null>(null);
  // Consolidated verdict (IO v1 ∧ IO v2 / geometry). Measurement-only — never
  // read by the revenue gate; see UseInViewResult.trulyVisible.
  const [trulyVisible, setTrulyVisible] = useState<boolean | null>(null);

  // Latest IO v2 `isVisible` for the observed element, tracked in a ref so the IO
  // v1 callback can consolidate against it without re-subscribing. `null` = not
  // yet reported (or v2 unsupported — the v1 callback falls back to geometry).
  const ioV2VisibleRef = useRef<boolean | null>(null);
  // Latest IO v1 reading (intersecting ∧ CSS visible), tracked in a ref so the
  // async IO v2 callback can re-derive the consolidated verdict against the
  // freshest v1 value rather than a stale render closure.
  const ioV1VisibleRef = useRef<boolean | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window.IntersectionObserver !== "function") {
      setIsVisible(true);
      setSource("unsupported");
      // Fail open on the consolidated verdict too — a missing observer must
      // never read as hidden (the revenue gate reads `isVisible`, but a
      // fail-open here keeps the measurement honest about "we couldn't tell").
      setTrulyVisible(true);
      return;
    }
    // No element yet — the callback ref hasn't fired (or fired with null). Wait
    // for it: this effect reruns once `element` changes. Do NOT fail open here,
    // or a later real attach would inherit a stale `true`.
    if (!element) return;

    const v2Supported = isIoV2Supported();
    ioV2VisibleRef.current = null;
    ioV1VisibleRef.current = null;

    // IO v2 observer — a separate instance with `trackVisibility` so the browser
    // reports its guaranteed-painted verdict. Only created where supported; its
    // latest reading feeds the consolidated verdict via `ioV2VisibleRef`. Wrapped
    // so an unsupported/throwing v2 can never break the v1 path. Created BEFORE
    // `recomputeTrulyVisible` so `v2Active` reflects whether it ACTUALLY
    // constructed — a runtime that advertises `isVisible` but throws on
    // `trackVisibility` must fall through to geometry, not sit forever on the
    // held v1 reading. Its callback's forward-reference to `recomputeTrulyVisible`
    // is safe: the callback only ever fires asynchronously, well after the const
    // below is initialised.
    let v2Observer: IntersectionObserver | undefined;
    if (v2Supported) {
      try {
        v2Observer = new window.IntersectionObserver(
          (entries) => {
            const latest = entries[entries.length - 1] as
              | (IntersectionObserverEntry & { isVisible?: boolean })
              | undefined;
            if (!latest) return;
            ioV2VisibleRef.current = typeof latest.isVisible === "boolean" ? latest.isVisible : null;
            // Re-derive the verdict against the freshest v1 reading we have.
            if (ioV1VisibleRef.current !== null) recomputeTrulyVisible(ioV1VisibleRef.current, latest.target);
          },
          { threshold, trackVisibility: true, delay: 100 } as IntersectionObserverInit
        );
      } catch {
        v2Observer = undefined;
      }
    }
    const v2Active = v2Observer !== undefined;

    // Consolidate today's IO v1 reading with the field-confirmed IO v2 signal
    // (or the geometry fallback where v2 isn't active). Kept in one place so
    // both the v1 and v2 callbacks recompute the same verdict.
    const recomputeTrulyVisible = (v1Visible: boolean, target: Element): void => {
      if (!v1Visible) {
        setTrulyVisible(false);
        return;
      }
      if (v2Active) {
        // Only downgrade once v2 has actually reported; before that, hold the v1
        // reading so an above-the-fold unit isn't a transient false negative.
        setTrulyVisible(ioV2VisibleRef.current === null ? true : ioV2VisibleRef.current);
        return;
      }
      setTrulyVisible(isGeometryOnScreen(target));
    };

    const observer = new window.IntersectionObserver(
      (entries) => {
        // The callback can batch several entries for one target; the last one is
        // the current state.
        const latest = entries[entries.length - 1];
        if (!latest) return;
        const v1Visible = latest.isIntersecting && isCssVisible(latest.target);
        ioV1VisibleRef.current = v1Visible;
        setIsVisible(v1Visible);
        setSource("measured");
        // rootBounds is nulled by the browser only for a cross-origin root, so
        // its absence on a genuine entry is the cross-origin-frame signal.
        setCrossOriginRoot(latest.rootBounds === null);
        recomputeTrulyVisible(v1Visible, latest.target);
      },
      { threshold }
    );

    try {
      observer.observe(element);
      v2Observer?.observe(element);
    } catch {
      observer.disconnect();
      v2Observer?.disconnect();
      setIsVisible(true);
      setSource("error");
      setTrulyVisible(true);
      return;
    }

    // A fresh observe on a (re)attached element hasn't measured yet — reset to
    // pending so a stale "measured"/"error" from a prior element doesn't linger.
    setSource("pending");
    return () => {
      observer.disconnect();
      v2Observer?.disconnect();
    };
  }, [enabled, element, threshold]);

  return useMemo(
    () => ({ ref, isVisible, source, crossOriginRoot, trulyVisible }),
    [ref, isVisible, source, crossOriginRoot, trulyVisible]
  );
}
