# ADR 003 — MutationObserver watches entire document

**Status**: Under review

## Context

The boot module attaches a single `MutationObserver` to `document` with
`{ childList: true, subtree: true }`. This was the simplest approach to detect when
`.gen-ext` containers are added or removed from the partner page at runtime (e.g. via
SPA navigation or lazy-loaded ad slots).

The broad scope means the observer fires on **any** descendant DOM mutation — including
mutations inside the widget's own Shadow DOM roots, style recalculations triggered by
scroll, and third-party widget updates. Each fire re-runs the container-scan predicate,
which is cheap but not free, and there is a latent risk that a self-mutation inside
a reel item triggers the "container removed" path prematurely.

No production incident has been attributed to this yet, but two test scenarios have
demonstrated false positives in local development with aggressive child re-renders.

## Decision

Keep the current `document`-level scope until a narrowed-scope implementation is
validated. The replacement will observe only the partner's known container element(s)
and use a `WeakMap` to track per-root observers.

A `?cxr-observer=narrow` URL flag is planned for Phase 4 to opt in to the narrowed
scope for gradual rollout and A/B comparison.

## Consequences

- **Risk**: rapid child re-renders inside a `.gen-ext` container could trigger premature
  unmount detection. Mitigation: the scan predicate checks `document.contains(el)` as a
  guard; an element still in the DOM will not be torn down.
- **Performance**: the broad observer adds ~0.1ms overhead per mutation batch on a
  typical partner page (measured via `performance.now()` in the observer callback).
  Acceptable until Phase 4 lands the narrowed scope.
- Once `?cxr-observer=narrow` is validated in production, this ADR will be updated to
  **Accepted** and the feature flag removed.
