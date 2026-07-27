/**
 * GenAd SDK loading and instance management — consolidated from:
 *   ads/loadGenAdSdk.ts
 *   ads/useGenAdInstance.ts
 */
import { useEffect, useRef, useState } from "react";

import { resolvePageUrl, resolveVideoAdMacros } from "@cxr/ads/adUrlMacros";
import { sampleAudioDiagnostic } from "@cxr/ads/audioDiagnostic";
import { normalizeBannerConfig, normalizeNativeConfig, normalizeVideoConfig } from "@cxr/ads/normalizers";
import type { AdProviderKind } from "@cxr/ads/normalizers";
import { EVENT } from "@cxr/analytics/analytics";
import { hostMacros } from "@cxr/hostMacros";
import { useEventBus } from "@cxr/instance/InstanceContext";
import { resolveClientIp } from "@cxr/platform/device";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { DEFAULT_UNMUTE_VOLUME } from "@cxr/providers/PlayerProvider";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import { getSharedGeoIp } from "@cxr/services/api";
import { resyncShadowStyles } from "@cxr/shadow-dom";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import { didServeDebugDeviceFeed } from "@cxr/strategies/debugDevices";
import { isStaticTag } from "@cxr/strategies/staticTagData";
import type { GenAdBlockedDetails } from "@cxr/types/window";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/gen-ad-sdk");

// ─── GenAd SDK loader ─────────────────────────────────────────────────────────

// import.meta.env shape is bundler-defined; the `?? {}` fallback is unreachable
// under Vite/Vitest (env is always defined), hence the v8 ignore. The `next 2`
// span covers the `?? {}` branch, which lives on the second line of the statement.
/* v8 ignore next 2 */
const _env: Record<string, string | undefined> =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env ?? {};

/** Base URL for the GenAd SDK assets. Set VITE_CXR_GEN_AD_BASE_URL to override. */
const GEN_AD_BASE_URL: string = _env.VITE_CXR_GEN_AD_BASE_URL ?? "https://media.begenuin.com/ad-sdk/1.0.0";

/** Cached promise — null until the first call to `loadGenAdSdk`. */
let genAdLoadPromise: Promise<void> | null = null;

/**
 * Upper bound on a diagnostic string copied out of the GenAd SDK.
 *
 * Error messages are browser- or third-party-authored (IMA's `getMessage()` can
 * embed a whole VAST URL) and unbounded. These land on an analytics event fired
 * once per blocked impression, so a long message is paid for on every event.
 */
const MAX_DIAGNOSTIC_STRING_LENGTH = 300;

/**
 * Coerces an SDK-supplied diagnostic value to a bounded string, or `null`.
 *
 * GenAd loads from a rolling CDN channel (`ad-sdk/1.0.0`) that we cannot pin, so
 * its declared callback types are not a runtime guarantee — a future build could
 * send a number, an `Error`, or nothing at all. Anything non-string becomes
 * `null` rather than being coerced to `"[object Object]"`, keeping the analytics
 * column honest: `null` means "not reported", never "reported as garbage".
 */
function asDiagnosticString(value: unknown): string | null {
  if (typeof value !== "string" || value === "") return null;
  return value.length > MAX_DIAGNOSTIC_STRING_LENGTH ? value.slice(0, MAX_DIAGNOSTIC_STRING_LENGTH) : value;
}

/**
 * Load the GenAd in-feed SDK (CSS + JS).
 *
 * Returns a singleton promise that resolves once the script has loaded (or
 * immediately if the script tag is already present in the DOM). Rejects if
 * the script fails to load.
 *
 * @returns Promise that resolves when the GenAd SDK is ready to use.
 */
export function loadGenAdSdk(): Promise<void> {
  if (genAdLoadPromise) return genAdLoadPromise;

  const genAdCssHref = `${GEN_AD_BASE_URL}/gen_ad.min.css`;

  genAdLoadPromise = new Promise<void>((resolve, reject) => {
    // GenAd content renders in document.body (via portal) so its CSS only needs
    // to live in document.head — no shadow root injection required.
    if (!document.querySelector(`link[href*="gen_ad.min.css"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = genAdCssHref;
      document.head.appendChild(link);
    }

    // If the script is already in the DOM, resolve immediately.
    if (document.querySelector(`script[src*="gen_ad.min.js"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `${GEN_AD_BASE_URL}/gen_ad.min.js`;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return genAdLoadPromise;
}

/**
 * Reset the singleton (intended for test isolation only).
 *
 * @internal
 */
export function _resetGenAdSdkSingleton(): void {
  genAdLoadPromise = null;
}

/**
 * Extract the primary ad URL from a resolved video-ad value for analytics.
 *
 * `resolveVideoAdMacros` returns a string, an object (`url` / `ads_url` /
 * `vastUrl`), or an array of either. Returns the FIRST resolved URL found, or
 * `undefined` when none is present. Logged as `ad_url` on ad events; reflects
 * the URL SENT (primary/highest-CPM entry), not necessarily the vendor that
 * filled (the SDK does not expose per-vendor fill).
 *
 * @param resolvedVideoAd - The value returned by `resolveVideoAdMacros`.
 * @returns The first resolved ad URL, or `undefined` when none is present.
 */
function extractPrimaryAdUrl(resolvedVideoAd: unknown): string | undefined {
  const first = Array.isArray(resolvedVideoAd) ? resolvedVideoAd[0] : resolvedVideoAd;
  if (typeof first === "string") return first || undefined;
  if (first && typeof first === "object") {
    const o = first as Record<string, unknown>;
    for (const key of ["url", "ads_url", "vastUrl"] as const) {
      if (typeof o[key] === "string" && o[key]) return o[key] as string;
    }
  }
  return undefined;
}

// ─── useGenAdInstance hook ────────────────────────────────────────────────────

/**
 * Default audible volume (0.0–1.0) applied when the user explicitly unmutes an
 * ad. Applied once, at the SDK boundary, only on a user-initiated unmute.
 * Shares the reel player's default so ad and content unmute to the same level.
 */
const UNMUTE_VOLUME = DEFAULT_UNMUTE_VOLUME;

/** Advertiser branding details. */
interface AdvertiserDetails {
  logo: string;
  primaryColor: string;
}

/** Companion content video descriptor. */
interface ContentVideo {
  url: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  objectFit: string;
}

/** Props for the `useGenAdInstance` hook. */
export interface UseGenAdInstanceOptions {
  /** Numeric slot id, used to derive the container DOM id. */
  id: number;
  /**
   * Per-widget instance identifier — namespaces the container DOM id so that
   * multiple widgets on the same page don't collide.
   */
  instanceId: string;
  /**
   * Ref to the slot's container element — used to read banner dimensions after
   * the DOM has been painted. Replaces the old `document.querySelector('.gen-ext')`
   * which always grabbed the first widget on the page.
   *
   * Optional: when omitted the hook falls back to `[300, 250]`.
   * `GenAdSlot` always provides this; callers that invoke the hook directly may omit it.
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Whether this slot is currently the active/visible slide. */
  isActive: boolean;
  /** Whether audio is muted. Synced to the SDK after every change. */
  isMuted: boolean;
  /**
   * Whether the ad request must wait for the user to unmute before firing.
   *
   * `true` (default) gates the request on the unmuted state — used for ad
   * breaks on organic videos, where requesting an ad on a still-muted video is
   * undesirable. `false` arms the request immediately on activation — used for
   * standalone `type:"ads"` slides, which should fill right away regardless of
   * the mute state.
   *
   * Callers (`AdLayout`, `VideoLayout`) don't hardcode this — it flows from
   * `NormalisedAd.gateOnUnmute` via `genAdSlotAdProps`, which in turn is sourced
   * from the backend's `ads_config.gate_on_unmute` / `reel.gate_on_unmute` flag
   * when present. This default only applies when no caller value is supplied.
   */
  gateOnUnmute?: boolean;
  /** Whether the ad is playing. Synced to the SDK after every change. */
  isPlaying?: boolean;
  /** Raw display/banner ad descriptor from the feed item. */
  displayAd?: unknown;
  /** Raw native ad descriptor from the feed item. */
  nativeAd?: unknown;
  /** Raw video ad descriptor from the feed item. */
  videoAd?: unknown;
  /** Advertiser branding for the video ad overlay. */
  videoAdAdvertiserDetails?: AdvertiserDetails;
  /** Companion content video for the ad slot. */
  videoAdContentVideo?: ContentVideo;
  /** Ad network platform identifiers. */
  platforms: { video?: string; banner?: string; native?: string };
  /** Feed item object — forwarded to analytics. */
  item: unknown;
  /** Called when an ad provider fills the slot. */
  onWaterfallSuccess?: (provider: AdProviderKind) => void;
  /** Called when the full waterfall fails to fill. */
  onWaterfallFail?: () => void;
  /** Called when the ad completes playback. */
  onAdCompleted?: () => void;
  /**
   * Called with the new mute state on a SYSTEM-driven volume change inside the ad
   * (browser autoplay policy, programmatic mute). User toggles are not forwarded
   * here — the host owns those via its own controls.
   */
  onMuteClick?: (muted: boolean) => void;
  /** Called when the ad starts playing (mirrors onMuteClick / onAdCompleted convention). */
  onAdPlay?: () => void;
  /** Called when the ad pauses (mirrors onMuteClick / onAdCompleted convention). */
  onAdPause?: () => void;
  /** Called when the ad SDK provides CTA details (advertiserLogo, ctaTitle, ctaUrl, onClick). */
  onAdCTA?: (cta: AdCtaDetails) => void;
  /**
   * Increment this value to force-destroy the current ad instance and reset
   * state (e.g. when the slide changes away while an ad is loading).
   */
  destroySignal: number;
  /**
   * Override for the SDK loader — injected in tests to avoid real network calls.
   * Defaults to the module-level `loadGenAdSdk`.
   *
   * @internal
   */
  _loadSdk?: () => Promise<void>;
}

/** CTA details provided by the ad SDK via onAdCTA callback. */
export interface AdCtaDetails {
  advertiserLogo: string;
  ctaTitle: string;
  ctaUrl: string;
  onClick: () => void;
}

/** Values exposed by the hook. */
export interface UseGenAdInstanceResult {
  /** Whether an ad provider has successfully loaded an ad. */
  adLoaded: boolean;
  /** Which provider filled the slot, or `null` before fill. */
  provider: AdProviderKind | null;
  /** The DOM element id that GenAd renders into. */
  containerId: string;
}

/**
 * Manage a single GenAd in-feed ad slot.
 *
 * Handles SDK loading, init, destroy, mute sync, analytics events, and the
 * `genad:destroy` global event. Mirrors the behaviour of `AdsPlaceholder.jsx`
 * exactly so the JSX component can be replaced by this hook + `GenAdSlot`.
 *
 * @param options - Slot configuration and event callbacks.
 * @returns Reactive slot state consumed by `GenAdSlot`.
 */
export function useGenAdInstance(options: UseGenAdInstanceOptions): UseGenAdInstanceResult {
  const {
    id,
    instanceId,
    containerRef,
    isActive,
    isMuted,
    gateOnUnmute = true,
    displayAd,
    nativeAd,
    videoAd,
    videoAdAdvertiserDetails,
    videoAdContentVideo,
    platforms,
    // item: _item,
    onWaterfallSuccess,
    onWaterfallFail,
    onAdCompleted,
    onMuteClick,
    isPlaying,
    onAdPlay,
    onAdPause,
    onAdCTA,
    destroySignal,
    _loadSdk = loadGenAdSdk,
  } = options;

  const bus = useEventBus();
  const { sendEvent, setBaseEventContext } = useAnalytics();
  const { shadowConfig, tagId } = useTagDetails();
  const shadowDom = shadowConfig != null;

  // Tags configured with `initialVolume > 0` want the ad to load audible. When
  // set, the ad is requested unmuted (bypassing the mute gate) and initialized
  // at this level instead of the shared `UNMUTE_VOLUME`. `0` keeps the legacy
  // muted/gated behaviour for every other tag.
  const { initialVolume, servedStatically } = useStrategy();
  const wantsAudibleAdStart = initialVolume > 0;
  // Level the ad unmutes to — both at init and on a later user re-unmute. Uses
  // the tag's configured `initialVolume` when set, else the shared default, so
  // init and re-unmute stay consistent for any tag value.
  const unmuteVolume = wantsAudibleAdStart ? initialVolume : UNMUTE_VOLUME;

  const containerId = `gen-ad-slot-${instanceId}-${id}`;

  // Refs for callbacks — keeps SDK closures from going stale when parent re-renders
  const onWaterfallSuccessRef = useRef(onWaterfallSuccess);
  const onWaterfallFailRef = useRef(onWaterfallFail);
  const onAdCompletedRef = useRef(onAdCompleted);
  const onMuteClickRef = useRef(onMuteClick);
  const onAdPlayRef = useRef(onAdPlay);
  const onAdPauseRef = useRef(onAdPause);
  const onAdCTARef = useRef(onAdCTA);
  onWaterfallSuccessRef.current = onWaterfallSuccess;
  onWaterfallFailRef.current = onWaterfallFail;
  onAdCompletedRef.current = onAdCompleted;
  onMuteClickRef.current = onMuteClick;
  onAdPlayRef.current = onAdPlay;
  onAdPauseRef.current = onAdPause;
  onAdCTARef.current = onAdCTA;

  // Guards against double-init within the same activation
  const instanceIdRef = useRef<number | null>(null);
  const initInFlightRef = useRef(false);

  // Last `onAdBlocked` reason from the SDK (e.g. "unmuted_autoplay_restricted"),
  // stamped onto the audio-diagnostic beacon. Diagnostic only — the mute/volume
  // state side is already handled by `unmute_blocked` via onVolumeChange.
  const adBlockedReasonRef = useRef<string | null>(null);

  // The underlying rejection behind that reason (GenAd >= 1.24.0, optional).
  // GenAd's guard rail reports EVERY play() rejection as "unmuted_autoplay_restricted",
  // but only NotAllowedError is a real autoplay block — an AbortError is not. Field
  // data showed audible-start ads muting even in sessions that already had a user
  // gesture, which a genuine block cannot explain, so capture the real error name to
  // size that false-positive rate before GenAd's fallback is narrowed.
  const adBlockedErrorNameRef = useRef<string | null>(null);
  const adBlockedErrorMessageRef = useRef<string | null>(null);
  const adBlockedSourceRef = useRef<string | null>(null);

  // Live mirror of `isMuted`. The init effect deps are intentionally narrow
  // ([isActive, requestArmed]) so a re-mute never tears the ad down, which means
  // `isMuted` is otherwise stale inside it — read the current value through the
  // ref so the SDK always inits with the real mute state, not the value captured
  // when `requestArmed` first latched.
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const [adLoaded, setAdLoaded] = useState(false);
  const [provider, setProvider] = useState<AdProviderKind | null>(null);

  // Ad requests are gated on the unmuted state: never request while muted. Once
  // the active slot is observed unmuted we latch `requestArmed` true so a later
  // re-mute does NOT re-run the init effect (which would tear the ad down) — only
  // deactivation clears it. `isMuted` is the global player mute, so the unmuted
  // state carries across slides exactly as the product spec requires.
  // `gateOnUnmute=false` (standalone `type:"ads"` slides) bypasses the gate and
  // arms the request immediately on activation.
  //
  // Also gated on `isPlaying` (same latch, only deactivation resets it) — keeps
  // ad-creative bytes out of the un-interacted HAI window while paused.
  const [requestArmed, setRequestArmed] = useState(false);
  useEffect(() => {
    if (!isActive) {
      setRequestArmed(false);
      return;
    }
    if (!isPlaying) return;

    if (wantsAudibleAdStart || !gateOnUnmute || !isMuted) setRequestArmed(true);
  }, [isActive, isMuted, gateOnUnmute, wantsAudibleAdStart, isPlaying]);

  // First available ad-source label for analytics
  const adSource = platforms.video || platforms.banner || platforms.native || undefined;

  // Emit `Ad Paused` (matches the Web SDK's ad vocabulary). Ad start is covered
  // by `onAdStarted` → `AD_STARTED`; the Web SDK binds no ad-resume event, so we
  // emit nothing on resume.

  const trackAdPaused = (): void => {
    sendEvent(EVENT.AD_PAUSED, { ad_source: adSource });
  };

  // destroySignal: force-destroy + reset when it increments
  useEffect(() => {
    if (!destroySignal) return;
    if (instanceIdRef.current != null) {
      (window as Window & { GenAd?: { destroy(id: number): void } }).GenAd?.destroy(instanceIdRef.current);
    }
    instanceIdRef.current = null;
    initInFlightRef.current = false;
    setAdLoaded(false);
    setProvider(null);
  }, [destroySignal]);

  // Listen for the per-instance genad:destroy event — scoped to the bus so
  // multiple widgets on the same page cannot cross-contaminate each other.
  useEffect(() => {
    const unsub = bus.on("genad:destroy", () => {
      if (instanceIdRef.current != null) {
        (window as Window & { GenAd?: { destroy(id: number): void } }).GenAd?.destroy(instanceIdRef.current);
      }
    });
    return unsub;
  }, [bus]);

  // Core ad init / cleanup effect
  useEffect(() => {
    // Gate on unmute: no ad request while muted; fires once `requestArmed` latches.
    if (!isActive || !requestArmed) return;

    // Double-init guard
    /* v8 ignore next 1 */
    if (initInFlightRef.current || instanceIdRef.current != null) return;

    let cancelled = false;
    // At most one terminal event (fill XOR no-fill) per waterfall run. Guards
    // against a duplicate SDK callback double-counting an impression/passback —
    // `singleHitWaterfall` only dedups across runs, not within one.
    let terminalFired = false;
    initInFlightRef.current = true;

    _loadSdk()
      .then(async () => {
        if (cancelled) {
          initInFlightRef.current = false;
          return;
        }

        // Clone gen_ad.min.css into the shadow root now that it's in document.head.
        const rootNode = containerRef?.current?.getRootNode();
        if (rootNode instanceof ShadowRoot) {
          resyncShadowStyles(rootNode);
        }

        /* v8 ignore next 6 */
        if (instanceIdRef.current != null) {
          (window as Window & { GenAd?: { destroy(id: number): void } }).GenAd?.destroy(instanceIdRef.current);
          instanceIdRef.current = null;
        }
        /* v8 ignore end */

        setAdLoaded(false);

        // In shadow DOM mode, pass the element directly so the SDK calls
        // element.getRootNode() to detect the shadow root automatically.
        // containerId alone won't work — document.getElementById() can't
        // reach elements inside a shadow root.
        const containerElement = shadowDom ? (containerRef?.current ?? undefined) : undefined;

        // Tags with `initialVolume > 0` request the ad audible: init unmuted at
        // the configured level. Seed `unmute_blocked: false` on the analytics
        // base context — it flips to `true` only if the SDK reports a
        // system-driven force-mute (browser autoplay policy) via onVolumeChange.
        if (wantsAudibleAdStart) {
          setBaseEventContext({ unmute_blocked: false });
          adBlockedReasonRef.current = null;
          adBlockedErrorNameRef.current = null;
          adBlockedErrorMessageRef.current = null;
          adBlockedSourceRef.current = null;
        }

        /**
         * Samples the SDK's media element and emits one diagnostic beacon.
         *
         * The element is created asynchronously by the SDK, so this yields a
         * macrotask before querying and no-ops if nothing ever mounts (banner /
         * native fills have no media at all).
         */
        const emitAudioDiagnostic = (extra: Record<string, unknown>): void => {
          setTimeout(() => {
            if (cancelled) return;
            const slot = containerRef?.current;
            // Hand over the CONTAINER, not a pre-picked element: the audio-ad
            // layout renders a decorative content video before the real audio
            // transport, and only once decoding starts can the sampler tell them
            // apart. Picking here would lock onto the decoy.
            if (!slot || !slot.querySelector("video, audio")) return;

            void sampleAudioDiagnostic(slot, {
              ...extra,
              wants_audible_ad_start: true,
              configured_volume: initialVolume,
              // Synthetic fill from a debug device's committed VAST feed, not a
              // won auction. Field queries MUST exclude these — the debug handsets
              // are device-targeted and would otherwise skew the audibility rate
              // we quote to Infolinks. Reads what was actually served, not mere
              // eligibility: a missing/malformed fixture falls back to the real
              // feed, and flagging that genuine fill would drop it from every
              // rate query (all of which filter `not forced_fill`).
              forced_fill: didServeDebugDeviceFeed(tagId),
              ad_blocked_reason: adBlockedReasonRef.current,
              // `null` here means either "no block" or "GenAd older than 1.24.0";
              // read alongside `ad_blocked_reason` to tell those apart.
              ad_blocked_error_name: adBlockedErrorNameRef.current,
              ad_blocked_error_message: adBlockedErrorMessageRef.current,
              ad_blocked_source: adBlockedSourceRef.current,
            })
              .then((snapshot) => {
                // A slot torn down mid-sample must not report — its element is
                // already detached, so the reading would be meaningless. A null
                // snapshot means the sampler hit an internal error and chose to
                // report nothing rather than throw; skip it.
                if (cancelled || !snapshot) return;
                sendEvent(EVENT.AUDIO_DIAGNOSTIC, snapshot);
              })
              // Belt-and-braces: the sampler already resolves null instead of
              // throwing, but a diagnostic must never surface as an unhandled
              // rejection in a publisher's page.
              .catch(() => undefined);
          }, 0);
        };

        const initOptions = {
          containerId,
          ...(containerElement ? { containerElement } : {}),
          muted: wantsAudibleAdStart ? false : isMutedRef.current,
          // Hand the target level to the SDK at init — it owns volume from here,
          // so the host never has to clamp it after the play transition. Audible
          // tags use their configured `initialVolume`; others share UNMUTE_VOLUME.
          volume: unmuteVolume,
          onWaterfallSuccess: (resolvedProvider: AdProviderKind): void => {
            // Drop a fill that is torn down / failed (cancelled) or a duplicate
            // terminal callback — else ad:fill after ad:nofill reads as a
            // malformed waterfall.
            if (cancelled || terminalFired) return;
            terminalFired = true;
            initInFlightRef.current = false;
            setAdLoaded(true);
            bus.emit("ad:fill", {});
            setProvider(resolvedProvider);
            onWaterfallSuccessRef.current?.(resolvedProvider);

            const adEventDetails = {
              provider: resolvedProvider,
              ad_source: platforms[resolvedProvider] || undefined,
            };
            sendEvent(EVENT.AD_RESPONSE_RECEIVED, adEventDetails);

            // Audible-start tags only: sample the live media element so we can
            // tell "the web layer muted it" from "the OS silenced a correctly
            // unmuted element" (iOS AVAudioSession). GenAd renders a real
            // <video> into our container — no iframe — and containerRef is the
            // node inside our shadow root, so an element-scoped query reaches
            // it. The audio-ad path's element is `display: none`, so never
            // filter on visibility or size here.
            if (wantsAudibleAdStart) {
              emitAudioDiagnostic({
                provider: resolvedProvider,
                ad_source: platforms[resolvedProvider] || undefined,
              });
            }
          },
          // Diagnostic only: the SDK auto-mutes and retries on an autoplay
          // block. Recorded for the beacon; the state side is already covered by
          // `unmute_blocked` (onVolumeChange, reason: "system").
          onAdBlocked: (blockedReason: string, blockedDetails?: GenAdBlockedDetails): void => {
            adBlockedReasonRef.current = blockedReason;
            // Optional second arg — absent on GenAd < 1.24.0, so guard rather
            // than destructure. GenAd ships from a rolling CDN channel we cannot
            // pin, so the declared types are a contract we don't control at
            // runtime: coerce instead of trusting them.
            adBlockedErrorNameRef.current = asDiagnosticString(blockedDetails?.errorName);
            adBlockedErrorMessageRef.current = asDiagnosticString(blockedDetails?.errorMessage);
            adBlockedSourceRef.current = asDiagnosticString(blockedDetails?.source);
          },
          onAdCompleted: (completedProvider?: AdProviderKind): void => {
            // A torn-down run's late completion must not destroy a later run's
            // instance or reset shared init state.
            if (cancelled) return;
            sendEvent(EVENT.AD_COMPLETED, {
              provider: completedProvider,
              ad_source: (completedProvider && platforms[completedProvider]) || adSource,
            });
            (window as Window & { GenAd?: { destroy(id: number): void } }).GenAd?.destroy(instanceIdRef.current!);
            instanceIdRef.current = null;
            initInFlightRef.current = false;
            onAdCompletedRef.current?.();
          },
          // Per-stage failure inside the waterfall. Mirrors gen-ad-container's
          // onStageFail categorisation: HTTP-status hints in the SDK error
          // message map a stage fail onto render-failed vs a generic ad error.
          // The waterfall-level no-fill path stays in `onWaterfallFail` below.
          onStageFail: (failedProvider: AdProviderKind, error?: Error): void => {
            const msg = error?.message ?? "";
            const details = {
              provider: failedProvider,
              ad_source: (failedProvider && platforms[failedProvider]) || adSource,
            };
            if (msg.includes("401") || msg.includes("403") || msg.includes("404")) {
              sendEvent(EVENT.AD_RENDER_FAILED, details);
            } else {
              sendEvent(EVENT.AD_ERROR, details);
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onWaterfallFail: (_failedProvider: string): void => {
            // One terminal event per run — drop a duplicate no-fill, or a
            // no-fill after a fill has already been reported.
            if (terminalFired) return;
            terminalFired = true;
            (window as Window & { GenAd?: { destroy(id: number): void } }).GenAd?.destroy(instanceIdRef.current!);
            cancelled = true;
            instanceIdRef.current = null;
            initInFlightRef.current = false;
            setAdLoaded(false);
            bus.emit("ad:nofill", {});
            sendEvent(EVENT.AD_REQUEST_FAILED, { ad_source: adSource });
            // Call after state resets so the carousel advance sees clean hook state
            onWaterfallFailRef.current?.();
          },
          onVolumeChange: (data: { volume: number; isMuted: boolean; reason?: "system" | "user" }): void => {
            // Only propagate SYSTEM-driven mute changes (browser autoplay policy,
            // programmatic mute) to the host. User toggles inside the ad are
            // already owned by the host's own controls / `ad:unmuteRequest` path —
            // echoing them back would double-handle or loop. Mirrors
            // gen-ad-container's `onSystemMuteChange` guard.
            if (data.reason === "system") {
              // Audible-start tag was force-muted by the browser's autoplay
              // policy — record it so analytics can measure the block rate.
              // Subsequent ad events on this load carry `unmute_blocked: true`.
              if (wantsAudibleAdStart && data.isMuted) {
                setBaseEventContext({ unmute_blocked: true });
              }
              onMuteClickRef.current?.(data.isMuted);
            }
          },
          onStageStart: (data: { stage: string }): void => {
            if (data.stage === "play") {
              onAdPlayRef.current?.();
            } else if (data.stage === "pause") {
              trackAdPaused();
              onAdPauseRef.current?.();
            }
          },
          onPlaybackStateChange: (data: { isPaused: boolean }): void => {
            if (data.isPaused) {
              trackAdPaused();
              onAdPauseRef.current?.();
            } else {
              onAdPlayRef.current?.();
            }
          },
          events: {
            onAdCTA: (cta: AdCtaDetails): void => {
              onAdCTARef.current?.(cta);
            },
            // SDK creative-lifecycle events, mirrored from gen-ad-container so
            // CXR reports the same per-creative analytics. `Ad Impression` is
            // intentionally NOT wired here — CXR emits it once on
            // `onWaterfallSuccess` (the proven fill signal); duplicating it on
            // the SDK render event would double-count impressions.
            onAdRendered: (event?: { provider?: AdProviderKind }): void => {
              sendEvent(EVENT.AD_RENDERED, {
                provider: event?.provider,
                ad_source: (event?.provider && platforms[event.provider]) || adSource,
              });
            },
            onAdImpression: (event?: {
              provider?: AdProviderKind;
              advertiserDomain?: string;
              creativeId?: string;
              mediaFileUrl?: string;
            }) => {
              const adEventDetails = {
                provider: event?.provider,
                ad_source: (event?.provider && platforms[event.provider]) || adSource,
                advertiser_domain: event?.advertiserDomain,
                creative_id: event?.creativeId,
                media_file_url: event?.mediaFileUrl,
              };
              sendEvent(EVENT.AD_IMPRESSION, adEventDetails);
            },
            // TEMPORARILY DISABLED: the `Ad Impression Pixel Fired` analytics
            // event is suppressed for now. The handler stays wired (as a no-op)
            // so the SDK's pixel still fires in gen-ad-container — only CXR's own
            // analytics emit is paused. To re-enable, restore the parameter and
            // the sendEvent body below.
            // TODO(krunal-s): re-enable AD_IMPRESSION_PIXEL_FIRED analytics.
            onAdImpressionPixelFire: (): void => {
              // No-op while disabled. When re-enabling, restore the original
              // signature and body:
              //   (event?: { provider?: AdProviderKind; ad_pixel_url?: string;
              //              ad_pixel_status_code?: string }) => {
              //     sendEvent(EVENT.AD_IMPRESSION_PIXEL_FIRED, {
              //       provider: event?.provider,
              //       ad_source: (event?.provider && platforms[event.provider]) || adSource,
              //       ad_pixel_url: event?.ad_pixel_url,
              //       ad_pixel_status_code: event?.ad_pixel_status_code,
              //     });
              //   }
            },
            onAdStarted: (event?: { provider?: AdProviderKind }): void => {
              sendEvent(EVENT.AD_STARTED, {
                provider: event?.provider,
                ad_source: (event?.provider && platforms[event.provider]) || adSource,
              });
            },
            onAdQuartile: (event?: { provider?: AdProviderKind; quartile?: number | string }): void => {
              sendEvent(EVENT.AD_MEDIA_QUARTILE, {
                provider: event?.provider,
                quartile: event?.quartile,
                ad_source: (event?.provider && platforms[event.provider]) || adSource,
              });
            },
            onAdSkipped: (event?: { provider?: AdProviderKind }): void => {
              // Skipping the ad blurs the host window and pauses the player;
              // refocus so playback resumes (mirrors gen-ad-container).
              window.focus();
              sendEvent(EVENT.AD_SKIPPED, {
                provider: event?.provider,
                ad_source: (event?.provider && platforms[event.provider]) || adSource,
              });
            },
            onAdClicked: (event?: { provider?: AdProviderKind }): void => {
              sendEvent(EVENT.AD_CLICKED, {
                provider: event?.provider,
                ad_source: (event?.provider && platforms[event.provider]) || adSource,
              });
            },
          },
          debug: process.env.NODE_ENV === "development",
        };

        // Read container dimensions after the DOM has been painted so we get the
        // actual slot size — avoids the old document.querySelector('.gen-ext') bug
        // that always grabbed the first widget on the page.
        const el = containerRef?.current ?? null;
        const bannerW = el ? el.clientWidth || (el as HTMLElement).offsetWidth : 300;
        const bannerH = el ? el.clientHeight || (el as HTMLElement).offsetHeight : 250;
        const bannerSize: [number, number] = [bannerW, bannerH];

        const bannerConfig = normalizeBannerConfig(displayAd, bannerSize);
        if (bannerConfig) {
          (initOptions as Record<string, unknown>).banner = bannerConfig;
        }

        const nativeConfig = normalizeNativeConfig(nativeAd);
        if (nativeConfig) {
          (initOptions as Record<string, unknown>).native = nativeConfig;
        }

        // Only rewrite (real ua + real ip) when the tag is actually served
        // statically — flag AND registry entry (see isStaticTag). A tag flagged
        // servedStatically but missing its fixtures falls back to the real feed,
        // whose ad URL is a live backend URL that must NOT be rewritten.
        const isServedStatically = isStaticTag(tagId, servedStatically);
        // Best-effort client IP for the ip-param rewrite: read the shared geoip
        // cache (same fetch analytics uses — no extra request). Never blocks: if it
        // hasn't resolved yet, `getSharedGeoIp` resolves fast and never rejects; a
        // null result leaves clientIp undefined → adUrlMacros strips ip instead.
        let clientIp: string | undefined;
        if (isServedStatically) {
          const geoip = await getSharedGeoIp().catch(() => null);
          // The await above yields the event loop: the slot may have torn down or
          // re-armed while geoip was in flight. Re-check before init so we never
          // create an SDK instance the cleanup (which already ran with a null
          // instanceIdRef, making its destroy a no-op) can't reach — that would
          // leak the ad and wedge the double-init guard on the next activation.
          if (cancelled) {
            initInFlightRef.current = false;
            return;
          }
          clientIp = resolveClientIp(geoip);
        }
        const resolvedVideoAd = resolveVideoAdMacros(videoAd, resolvePageUrl(), hostMacros, {
          servedStatically: isServedStatically,
          clientIp,
        });
        // Log the resolved primary ad URL on every ad event this slot emits.
        // Setting it into the base event context (rather than each call site)
        // stamps `ad_url` onto AD_REQUESTED below and all subsequent ad events.
        const adUrl = extractPrimaryAdUrl(resolvedVideoAd);
        if (adUrl) {
          setBaseEventContext({ ad_url: adUrl });
        }

        const videoConfig = normalizeVideoConfig(
          resolvedVideoAd,
          platforms,
          videoAdAdvertiserDetails,
          videoAdContentVideo
        );
        if (videoConfig) {
          (initOptions as Record<string, unknown>).video = videoConfig;
        }

        const GenAd = (window as Window & { GenAd?: { init(o: typeof initOptions): number | null } }).GenAd;
        const sdkInstanceId = GenAd?.init(initOptions);

        sendEvent(EVENT.AD_REQUESTED, { ad_source: adSource });

        if (sdkInstanceId != null) {
          instanceIdRef.current = sdkInstanceId;
        }
      })
      .catch((error) => {
        initInFlightRef.current = false;
        // A rejected SDK load is the common ad-blocker / network-failure case:
        // gen_ad.min.js never arrives, so no onWaterfallFail can fire. Without a
        // terminal here the slot sits silently empty — the parent page gets no
        // no-fill callback and analytics under-counts requests. Treat it as a
        // waterfall no-fill (once, unless already terminal).
        if (cancelled || terminalFired) return;
        terminalFired = true;
        _logger.warn("GenAd SDK failed to load — reporting no-fill", error);
        setAdLoaded(false);
        bus.emit("ad:nofill", {});
        sendEvent(EVENT.AD_REQUEST_FAILED, { ad_source: adSource });
        onWaterfallFailRef.current?.();
      });

    return () => {
      cancelled = true;
      initInFlightRef.current = false;
      (window as Window & { GenAd?: { destroy(id: number): void } }).GenAd?.destroy(instanceIdRef.current!);
      instanceIdRef.current = null;
      setAdLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally narrow: re-init only on (de)activation or arming, not on every mute toggle
  }, [isActive, requestArmed]);

  // Notify GenAd SDK when fullscreen state changes so it can re-render and adapt to the new viewport
  useEffect(() => {
    let setTinyTimeout: ReturnType<typeof setTimeout>;
    /* v8 ignore next -- defensive: useEventBus() always returns a bus, so the falsy guard is unreachable */
    if (!bus) return;
    const handleFullScreenChange = (): void => {
      if (!isActive) return;
      // Use setTimeout to ensure DOM has updated before calling updateView
      setTinyTimeout = setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          window.GenAd &&
          typeof window.GenAd.updateView === "function" &&
          instanceIdRef.current != null
        ) {
          window.GenAd.updateView(instanceIdRef.current);
        }
      }, 10);
    };

    const unSubFullScreenEnter = bus.on("fullscreen:enter", handleFullScreenChange);
    const unSubFullScreenExit = bus.on("fullscreen:exit", handleFullScreenChange);

    return () => {
      unSubFullScreenEnter();
      unSubFullScreenExit();
      clearTimeout(setTinyTimeout);
    };
  }, [bus, isActive]);

  // Event-driven, gesture-bound user unmute. ClickOverlay emits
  // `ad:unmuteRequest` SYNCHRONOUSLY from its tap handler; CxrEventBus.emit
  // invokes this handler inline in the same call stack, so the SDK volume/unmute
  // call stays inside the iOS Safari user-gesture window (never deferred to an
  // effect). This is the exclusive volume-on-unmute path — the mute-sync effect
  // below never sets volume.
  //
  // Instance targeting: every slot's hook subscribes to the same per-widget bus,
  // but acts only when `detail.containerId` matches its own `containerId`, so a
  // tap on one slot never unmutes another. `containerId` is unique per slot
  // (`gen-ad-slot-${instanceId}-${id}`).
  //
  // Only acts on a real muted→unmuted transition: if the ad is already unmuted
  // the unmute is a no-op, so we skip both the volume bump and the redundant
  // mute call.
  useEffect(() => {
    const unsub = bus.on("ad:unmuteRequest", (detail): void => {
      if (detail.containerId !== containerId) return;
      if (!isMutedRef.current) return;

      const GenAd = (
        window as Window & {
          GenAd?: {
            muteByContainer(c: string, m: boolean): void;
            setVolumeByContainer?(c: string, v: number): void;
          };
        }
      ).GenAd;
      if (!GenAd) return;

      if (typeof GenAd.setVolumeByContainer === "function") {
        GenAd.setVolumeByContainer(containerId, unmuteVolume);
      }
      if (typeof GenAd.muteByContainer === "function") {
        GenAd.muteByContainer(containerId, false);
      }
    });
    return unsub;
  }, [bus, containerId, unmuteVolume]);

  // Keep SDK mute state in sync with the external isMuted prop for SYSTEM-driven
  // changes (SDK onVolumeChange → setMuted system, programmatic mute, etc.).
  // This effect must NOT set volume — volume-on-unmute is owned exclusively by
  // the synchronous `ad:unmuteRequest` handler above.
  //
  // Also re-runs on `adLoaded`: gated-on-unmute ads only request AFTER the user
  // unmutes, so the unmute that triggers the request fires before this slot's SDK
  // instance exists — this sync is a no-op against a not-yet-created instance at
  // that moment. Without re-applying on load the SDK can stay stranded muted
  // (browser autoplay) while the host shows unmuted. Re-syncing once the ad fills
  // forces the SDK to the host's real mute state and clears that desync.
  useEffect(() => {
    const GenAd = (
      window as Window & {
        GenAd?: { muteByContainer(c: string, m: boolean): void };
      }
    ).GenAd;
    if (!GenAd) return;
    GenAd.muteByContainer(containerId, isMuted);
  }, [isMuted, containerId, adLoaded]);

  // Keep SDK play/pause state in sync with the external isPlaying prop (v1.17.0)
  useEffect(() => {
    // early return if the SDK method isn't available — avoids errors in older versions of the SDK and ensures this effect is safe to include even before the SDK has loaded
    if (window.GenAd === undefined || typeof window.GenAd.pauseByContainer !== "function") {
      return;
    }
    if (isPlaying) {
      window.GenAd?.resumeByContainer(containerId);
    } else {
      window.GenAd?.pauseByContainer(containerId);
    }
  }, [isPlaying, containerId]);

  return { adLoaded, provider, containerId };
}
