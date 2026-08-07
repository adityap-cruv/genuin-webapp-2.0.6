/**
 * Viewability diagnostic sampler.
 *
 * `useInView` decides `unit_visible` from `IntersectionObserver` v1
 * (`isIntersecting`) plus CSS `visibility`. Both live entirely inside the DOM,
 * so when a host hides our unit at the NATIVE layer — an off-screen / 0-size /
 * `View.INVISIBLE` Android WebView, or a preloaded-but-unshown interstitial —
 * the document still lays out at full size with the element dead-centre, and
 * `unit_visible` reads `true` for a unit no human can see. IO v1 cannot see
 * native compositing; nothing purely in the DOM can, directly.
 *
 * This module fires ONE snapshot per fill that captures EVERY candidate signal
 * side-by-side — the ones that MIGHT reflect real on-screen state where IO v1
 * cannot — so field data can tell us which one flips to "hidden" against a
 * known-hidden ground truth before we change the `unit_visible` definition:
 *
 *   - **IO v2 `trackVisibility`** — the browser only reports `isVisible: true`
 *     when it can *guarantee* the element is actually painted (occlusion, zero
 *     opacity, and non-composited frames all force `false`).
 *   - **requestAnimationFrame liveness** — a surface that isn't being composited
 *     (off-screen / hidden) has its rAF callbacks throttled or stopped, so a
 *     near-zero frame count over a fixed window is a strong "not drawn" proxy.
 *   - **Page Visibility** — catches `View.GONE/INVISIBLE` and backgrounding.
 *   - **MRAID / OMID** — the native ad SDK's own viewability verdict, the only
 *     signal computed with knowledge of the real native geometry (when present).
 *   - **Geometry / viewport / frame context** — cheap corroborators.
 *
 * Instrumentation only — reads state, never mutates playback, layout, or the
 * observed element. Wrapped so it can never throw inside a publisher's page:
 * any failure resolves `null`, exactly like {@link sampleAudioDiagnostic}.
 */
import { isWebView } from "@cxr/platform/device";

/** Observation window — long enough for IO v2 (`delay:100`) and rAF to report. */
const DEFAULT_WINDOW_MS = 500;

/** Monotonic-ish clock, preferring `performance.now`; falls back to `Date.now`. */
function now(): number {
  try {
    if (typeof performance.now === "function") {
      return performance.now();
    }
  } catch {
    /* fall through */
  }
  return Date.now();
}

/** One diagnostic snapshot, plus any caller-supplied context merged on top. */
export interface VisibilityDiagnosticSnapshot extends Record<string, unknown> {
  /** Best-effort webview detection — the reported hiding is webview-specific. */
  is_webview: boolean;
  /** `window.top === window.self`, or `false` if that read is cross-origin. */
  is_top_window: boolean;

  // --- IntersectionObserver v1 (today's `unit_visible` basis) ---
  /** `isIntersecting` of the last v1 entry; `null` if no callback arrived. */
  io_v1_intersecting: boolean | null;
  /** `intersectionRatio` of the last v1 entry; `null` if none. */
  io_v1_ratio: number | null;
  /** `rootBounds === null` (browser nulls it for a cross-origin root); `null` if none. */
  io_v1_root_bounds_null: boolean | null;

  // --- IntersectionObserver v2 (`trackVisibility`) ---
  /** Whether this runtime exposes `isVisible` (IO v2). */
  io_v2_supported: boolean;
  /** `entry.isVisible` — the guaranteed-visible verdict; `null` if unsupported / no callback. */
  io_v2_is_visible: boolean | null;
  /** `intersectionRatio` from the v2 observer; `null` if unsupported / no callback. */
  io_v2_ratio: number | null;

  // --- requestAnimationFrame liveness ---
  /** Whether `requestAnimationFrame` exists in this runtime. */
  raf_supported: boolean;
  /** Frames observed during the window (near-zero ⇒ surface likely not drawn). */
  raf_frames: number;
  /** Actual window length in ms the frame count was measured over. */
  raf_window_ms: number;
  /** Frames-per-second derived from `raf_frames / raf_window_ms`. */
  raf_fps: number;
  /** Ms from sample start to the first frame; `null` if no frame fired. */
  raf_first_frame_ms: number | null;

  // --- Page Visibility ---
  /** `document.visibilityState` ("visible" | "hidden" | "prerender" | ...). */
  document_visibility_state: string;
  /** `document.hidden`. */
  document_hidden: boolean;
  /** `document.hasFocus()`. */
  document_has_focus: boolean;
  /** `document.prerendering` (Speculation Rules); `null` where the API is absent. */
  document_prerendering: boolean | null;

  // --- MRAID / OMID (native ad-SDK viewability) ---
  /** Whether `window.mraid` exists — an MRAID ad container. */
  mraid_present: boolean;
  /** `mraid.getState()`; `null` if absent / threw. */
  mraid_state: string | null;
  /** `mraid.isViewable()`; `null` if absent / threw. */
  mraid_is_viewable: boolean | null;
  /** MRAID 3 exposure percentage from `getCurrentPosition`/`exposureChange`; `null` if absent. */
  mraid_exposure: number | null;
  /** `mraid.getPlacementType()`; `null` if absent / threw. */
  mraid_placement_type: string | null;
  /** Whether an OMID (Open Measurement) service is present. */
  omid_present: boolean;

  // --- Geometry / CSS ---
  rect_x: number;
  rect_y: number;
  rect_width: number;
  rect_height: number;
  computed_display: string;
  computed_visibility: string;
  computed_opacity: number;
  /** Whether the element's rect overlaps the inner viewport with positive area. */
  in_viewport: boolean;

  // --- Viewport / device ---
  viewport_inner_width: number;
  viewport_inner_height: number;
  visual_viewport_width: number | null;
  visual_viewport_height: number | null;
  visual_viewport_scale: number | null;
  screen_width: number;
  screen_height: number;
  device_pixel_ratio: number;
}

/** `window.top === window.self`, defaulting to `false` when the read throws (cross-origin). */
function readIsTopWindow(): boolean {
  try {
    return window.top === window.self;
  } catch {
    return false;
  }
}

/** Element geometry + computed box state; safe defaults on any failure. */
function readGeometry(element: Element): {
  rect_x: number;
  rect_y: number;
  rect_width: number;
  rect_height: number;
  computed_display: string;
  computed_visibility: string;
  computed_opacity: number;
  in_viewport: boolean;
} {
  let rect = { x: 0, y: 0, width: 0, height: 0 };
  try {
    const r = element.getBoundingClientRect();
    rect = { x: r.x, y: r.y, width: r.width, height: r.height };
  } catch {
    /* keep zeros */
  }
  let display = "unknown";
  let visibility = "unknown";
  let opacity = 1;
  try {
    const cs = window.getComputedStyle(element);
    display = cs.display;
    visibility = cs.visibility;
    const parsed = parseFloat(cs.opacity);
    opacity = Number.isFinite(parsed) ? parsed : 1;
  } catch {
    /* keep defaults */
  }
  let inViewport = false;
  try {
    const w = window.innerWidth;
    const h = window.innerHeight;
    inViewport =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.x < w &&
      rect.y < h &&
      rect.x + rect.width > 0 &&
      rect.y + rect.height > 0;
  } catch {
    /* keep false */
  }
  return {
    rect_x: rect.x,
    rect_y: rect.y,
    rect_width: rect.width,
    rect_height: rect.height,
    computed_display: display,
    computed_visibility: visibility,
    computed_opacity: opacity,
    in_viewport: inViewport,
  };
}

/** Viewport + device metrics; safe defaults on any failure. */
function readViewportDevice(): {
  viewport_inner_width: number;
  viewport_inner_height: number;
  visual_viewport_width: number | null;
  visual_viewport_height: number | null;
  visual_viewport_scale: number | null;
  screen_width: number;
  screen_height: number;
  device_pixel_ratio: number;
} {
  let innerW = 0;
  let innerH = 0;
  let dpr = 1;
  try {
    innerW = window.innerWidth;
    innerH = window.innerHeight;
    dpr = window.devicePixelRatio;
  } catch {
    /* keep defaults */
  }
  let vvW: number | null = null;
  let vvH: number | null = null;
  let vvScale: number | null = null;
  try {
    const vv = window.visualViewport;
    if (vv) {
      vvW = vv.width;
      vvH = vv.height;
      vvScale = vv.scale;
    }
  } catch {
    /* keep null */
  }
  let screenW = 0;
  let screenH = 0;
  try {
    screenW = window.screen.width;
    screenH = window.screen.height;
  } catch {
    /* keep zeros */
  }
  return {
    viewport_inner_width: innerW,
    viewport_inner_height: innerH,
    visual_viewport_width: vvW,
    visual_viewport_height: vvH,
    visual_viewport_scale: vvScale,
    screen_width: screenW,
    screen_height: screenH,
    device_pixel_ratio: Number.isFinite(dpr) ? dpr : 1,
  };
}

/** Page Visibility + prerender state; safe defaults on any failure. */
function readPageVisibility(): {
  document_visibility_state: string;
  document_hidden: boolean;
  document_has_focus: boolean;
  document_prerendering: boolean | null;
} {
  let state = "unknown";
  let hidden = false;
  let hasFocus = false;
  let prerendering: boolean | null = null;
  try {
    state = document.visibilityState;
    hidden = document.hidden;
    hasFocus = document.hasFocus();
    const pre = (document as Document & { prerendering?: boolean }).prerendering;
    prerendering = typeof pre === "boolean" ? pre : null;
  } catch {
    /* keep defaults */
  }
  return {
    document_visibility_state: state,
    document_hidden: hidden,
    document_has_focus: hasFocus,
    document_prerendering: prerendering,
  };
}

/** MRAID container probe (read-only); every field `null` when absent / on error. */
function readMraid(): {
  mraid_present: boolean;
  mraid_state: string | null;
  mraid_is_viewable: boolean | null;
  mraid_exposure: number | null;
  mraid_placement_type: string | null;
} {
  interface Mraid {
    getState?: () => string;
    isViewable?: () => boolean;
    getCurrentPosition?: () => unknown;
    getPlacementType?: () => string;
  }
  const absent = {
    mraid_present: false,
    mraid_state: null,
    mraid_is_viewable: null,
    mraid_exposure: null,
    mraid_placement_type: null,
  };
  let mraid: Mraid | undefined;
  try {
    mraid = (window as Window & { mraid?: Mraid }).mraid;
  } catch {
    return absent;
  }
  if (!mraid) return absent;

  const read = <T>(fn: (() => T) | undefined): T | null => {
    if (typeof fn !== "function") return null;
    try {
      return fn();
    } catch {
      return null;
    }
  };
  return {
    mraid_present: true,
    mraid_state: read(mraid.getState),
    mraid_is_viewable: read(mraid.isViewable),
    // MRAID 3 exposure rides on getCurrentPosition/exposureChange; we read the
    // best-effort exposure percentage if the object carries one.
    mraid_exposure: (() => {
      const pos = read(mraid.getCurrentPosition) as { exposurePercentage?: number } | null;
      const pct = pos?.exposurePercentage;
      return typeof pct === "number" ? pct : null;
    })(),
    mraid_placement_type: read(mraid.getPlacementType),
  };
}

/** Whether an OMID (Open Measurement) service object is present. */
function readOmidPresent(): boolean {
  try {
    const w = window as Window & { omid3p?: unknown; omidBridge?: unknown; OmidSessionClient?: unknown };
    return Boolean(w.omid3p || w.omidBridge || w.OmidSessionClient);
  } catch {
    return false;
  }
}

/**
 * Sample every candidate viewability signal once, over `windowMs`, and resolve
 * a merged snapshot (or `null` on any internal failure — a missing diagnostic
 * is always preferable to a console error on someone else's page).
 *
 * @param element  The ad-slot container to measure (the node handed to the SDK).
 * @param extra    Caller context merged onto the snapshot (e.g. `forced_fill`).
 * @param windowMs Observation window; defaults to 500ms.
 *
 * @example
 * const snap = await sampleVisibilityDiagnostic(slot, { forced_fill: false });
 * if (snap) sendEvent(EVENT.VISIBILITY_DIAGNOSTIC, snap);
 */
export function sampleVisibilityDiagnostic(
  element: Element,
  extra: Record<string, unknown> = {},
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<VisibilityDiagnosticSnapshot | null> {
  return new Promise<VisibilityDiagnosticSnapshot | null>((resolve) => {
    try {
      const observers: IntersectionObserver[] = [];
      let v1Intersecting: boolean | null = null;
      let v1Ratio: number | null = null;
      let v1RootNull: boolean | null = null;
      let v2Supported = false;
      let v2IsVisible: boolean | null = null;
      let v2Ratio: number | null = null;

      const IO = window.IntersectionObserver;
      if (typeof IO === "function") {
        try {
          const o1 = new IO((entries) => {
            const e = entries[entries.length - 1];
            if (!e) return;
            v1Intersecting = e.isIntersecting;
            v1Ratio = e.intersectionRatio;
            v1RootNull = e.rootBounds === null;
          });
          o1.observe(element);
          observers.push(o1);
        } catch {
          /* leave v1 null */
        }

        const proto = window.IntersectionObserverEntry?.prototype as
          | (IntersectionObserverEntry & { isVisible?: boolean })
          | undefined;
        if (proto && "isVisible" in proto) {
          v2Supported = true;
          try {
            const o2 = new IO(
              (entries) => {
                const e = entries[entries.length - 1] as IntersectionObserverEntry & { isVisible?: boolean };
                if (!e) return;
                v2IsVisible = typeof e.isVisible === "boolean" ? e.isVisible : null;
                v2Ratio = e.intersectionRatio;
              },
              { trackVisibility: true, delay: 100 } as IntersectionObserverInit
            );
            o2.observe(element);
            observers.push(o2);
          } catch {
            /* supported flag stays true; values stay null */
          }
        }
      }

      const raf = window.requestAnimationFrame;
      const rafSupported = typeof raf === "function";
      let rafFrames = 0;
      let rafFirst: number | null = null;
      let rafId = 0;
      // Hard stop so the self-re-registering loop always terminates at the end of
      // the window, even on a (pathological) runtime that has requestAnimationFrame
      // but no cancelAnimationFrame — never a runaway loop in a publisher's page.
      let rafStopped = false;
      const start = now();
      if (rafSupported) {
        const tick = (): void => {
          if (rafStopped) return;
          rafFrames += 1;
          if (rafFirst === null) rafFirst = Math.round(now() - start);
          rafId = raf(tick);
        };
        rafId = raf(tick);
      }

      setTimeout(() => {
        try {
          rafStopped = true;
          for (const o of observers) o.disconnect();
          if (rafSupported && typeof window.cancelAnimationFrame === "function") {
            window.cancelAnimationFrame(rafId);
          }
          const elapsed = Math.max(1, Math.round(now() - start));
          resolve({
            is_webview: isWebView(),
            is_top_window: readIsTopWindow(),
            io_v1_intersecting: v1Intersecting,
            io_v1_ratio: v1Ratio,
            io_v1_root_bounds_null: v1RootNull,
            io_v2_supported: v2Supported,
            io_v2_is_visible: v2IsVisible,
            io_v2_ratio: v2Ratio,
            raf_supported: rafSupported,
            raf_frames: rafFrames,
            raf_window_ms: elapsed,
            raf_fps: Math.round((rafFrames / elapsed) * 1000),
            raf_first_frame_ms: rafFirst,
            ...readPageVisibility(),
            ...readMraid(),
            omid_present: readOmidPresent(),
            ...readGeometry(element),
            ...readViewportDevice(),
            ...extra,
          });
        } catch {
          resolve(null);
        }
      }, windowMs);
    } catch {
      resolve(null);
    }
  });
}
