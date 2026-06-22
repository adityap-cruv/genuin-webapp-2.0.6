# ADR 001 — Drop Swiper, replace with CSS scroll-snap

**Status**: Accepted

## Context

The legacy widget bundled `swiper@12` (~25KB gz) solely for vertical snap-scrolling between
reel items. Swiper provides physics-based momentum, programmatic API, and loop mode — none
of which the CXR feed uses. The dependency was cargo-culted from the main app. On mobile
the 300ms input-to-snap latency from Swiper's touch handler was also measurable.

## Decision

Remove `swiper` from `dependencies`. Implement vertical snap using:

- CSS `scroll-snap-type: y mandatory` on the feed container.
- `scroll-snap-align: start` on each `ReelItem`.
- `IntersectionObserver` to detect which item is in view (replaces Swiper's `slideChange`
  event for analytics quartile tracking).
- Pointer-event handlers for swipe velocity where native scroll physics differ from
  expected UX (e.g. desktop trackpad vs. touch).

A `?cxr-engine=swiper` feature flag is reserved for A/B comparison of scroll physics
during a transition window; it dynamically imports Swiper only when the flag is present.

## Consequences

- Bundle saves ~25KB gz immediately on Phase 4 landing.
- Native scroll-snap physics differ slightly from Swiper's spring-easing on Android
  Chrome. The A/B flag mitigates user-visible regression during rollout.
- Swiper's programmatic API (`swiper.slideNext()`) is no longer available; callers that
  need to advance the feed programmatically must use `scrollIntoView({ behavior: 'smooth' })`.
- Any future re-addition of `swiper` requires explicit team approval and a bundle-budget
  justification.
