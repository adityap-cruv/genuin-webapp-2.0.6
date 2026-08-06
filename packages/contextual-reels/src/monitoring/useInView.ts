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
import { useCallback, useEffect, useMemo, useState } from "react";

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
}

/** Whether `element`'s computed `visibility` isn't `hidden`. Defaults open on error. */
function isCssVisible(element: Element): boolean {
  try {
    return window.getComputedStyle(element).visibility !== "hidden";
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

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window.IntersectionObserver !== "function") {
      setIsVisible(true);
      setSource("unsupported");
      return;
    }
    // No element yet — the callback ref hasn't fired (or fired with null). Wait
    // for it: this effect reruns once `element` changes. Do NOT fail open here,
    // or a later real attach would inherit a stale `true`.
    if (!element) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        // The callback can batch several entries for one target; the last one is
        // the current state.
        const latest = entries[entries.length - 1];
        if (!latest) return;
        setIsVisible(latest.isIntersecting && isCssVisible(latest.target));
        setSource("measured");
        // rootBounds is nulled by the browser only for a cross-origin root, so
        // its absence on a genuine entry is the cross-origin-frame signal.
        setCrossOriginRoot(latest.rootBounds === null);
      },
      { threshold }
    );

    try {
      observer.observe(element);
    } catch {
      observer.disconnect();
      setIsVisible(true);
      setSource("error");
      return;
    }

    // A fresh observe on a (re)attached element hasn't measured yet — reset to
    // pending so a stale "measured"/"error" from a prior element doesn't linger.
    setSource("pending");
    return () => observer.disconnect();
  }, [enabled, element, threshold]);

  return useMemo(() => ({ ref, isVisible, source, crossOriginRoot }), [ref, isVisible, source, crossOriginRoot]);
}
