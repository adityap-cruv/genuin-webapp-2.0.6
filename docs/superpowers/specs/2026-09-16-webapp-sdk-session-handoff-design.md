# WebApp → WebSDK Session Hand-off (zero-API auth) — Design

**Date:** 2026-09-16
**Author:** Dhairya Patel
**Branch:** `release/genuin-sdk/2.0.6`
**Status:** Approved design — ready for implementation plan

---

## Goal

When a user is logged into the WebApp, hand the full authenticated session
(user + tokens) to a WebSDK embed/placement rendered on the same page so the SDK
renders **authenticated without making any auth/login API call** (`/sso/autologin`).
Cover initial load, multiple embeds, dynamic embeds, and live login/logout/refresh
transitions.

## Non-goals

- No change to the WebApp's own login flow, NextAuth, or its modal.
- No new refresh mechanism (2.0.6 `AuthProvider` already self-syncs refresh — see §4).
- Not adding a login UI to the SDK (it stays token/session-driven).

---

## Current state (verified)

- WebApp renders the **hosted** SDK bundle (`gen_sdk.min.js`, pinned **v2.0.5**) via
  `apps/webapp/src/components/genuin-sdk-loader.tsx`, mounted in the `(new)` layout
  group (`apps/webapp/src/app/(site)/(new)/layout.tsx:114`). Loader calls
  `window.genuin.init({})` — **empty config, no token/user**. `parse-sdk-params.ts`
  carries only `embed_id`/`placement_id`/`style_id`.
- SDK init no-token branch (`packages/web-sdk/src/sdk/genuin-sdk.ts:449-459`):
  `else { removeUserData(); user = null }` → renders logged-out **and wipes** the
  shared `genuin-user-data` localStorage key.
- WebApp's session source-of-truth is **NextAuth only** (`useSession` in `auth-bridge.tsx`);
  the SDK reads it not at all. (The Zustand `genuin-options` store is **old flow, not the
  live source** — do not wire against it.) Shared localStorage key `genuin-user-data` is created only
  by the SDK `TokenManager`; `AuthProvider.updateLocalStorageUserData` is merge-only
  (`packages/components/src/context/auth/provider.tsx:57`, never creates it).
- **No existing public method accepts a user object.** `init`/`update` take
  `ConfigByUser` (token + params). No `setUser`/`hydrateUser`.
- **Cross-bundle channel that DOES exist:** `window.genuin` is the single object shared
  across both bundles. `SDKEventEmitter` (`packages/components/src/lib/sdk-event-emitter.ts`)
  bridges through `window.genuin.emitInternal/onInternal/offInternal`. The SDK's
  `AuthProvider` already listens for `SDK_AUTHENTICATE_USER` / `LOGOUT_USER`
  (`provider.tsx:152`, `:136`); `TokenManager` already listens for `CACHED_USER_UPDATE`
  (`packages/web-sdk/src/core/token-manager.ts:56`).

## Decisions locked with the user

1. **Zero auth API, ever** for the hand-off path.
2. **Pre-seed localStorage** as the seed medium — but **encapsulated behind an SDK method**
   so the WebApp never touches the raw key/shape (fixes v2.0.5/2.0.6 drift fragility).
3. **Full lifecycle sync** — login, logout, and token-refresh all reach live embeds.
4. **WebApp accessToken used as-is** (subject to the backend verification in §6).
5. **Precedence: token > cached user.** A valid token at init ignores the cached user and
   authenticates from the token; cached user is used only when no token is present;
   `removeUserData()` runs only when there is genuinely no cached user.
6. Within `TokenManager.getCurrentUser`, keep the existing **cache-hit-on-match**:
   when a token IS present, still skip `/sso/autologin` if
   `storedUserData.autoLoginToken === token`.
7. Zero-API primary path: **`setUser()` seeds, then WebApp calls `init({})` WITHOUT a
   token** → else-branch → cached user → no API.

## Chosen approach (A)

Add a small, typed, SDK-owned inbound method `genuin.setUser(session)` that seeds the
SDK's own cache + storage and emits the existing live-sync event. WebApp calls it after
login (and on already-logged-in load), and calls `genuin.logout()` on logout. Refresh is
already handled inside 2.0.6 `AuthProvider`. WebApp never touches SDK-private storage.

Rejected: pure pre-seed (hardcodes SDK internals in WebApp; still needs the event for
live sync); token-only + one autologin (violates zero-API).

---

## Design

### §1 — `setUser` public contract

Add to `packages/web-sdk/src/index.ts` (window.genuin) + `Genuin`/`GenuinSDK` static +
`packages/web-sdk/src/loader.js` wrapper + `packages/components/src/types/genuin-sdk.d.ts`.

```ts
type SessionHandoff = {
  user: AuthUser;          // fully parsed user (WebApp maps NextAuth session -> AuthUser)
  accessToken: string;
  refreshToken?: string;
};

genuin.setUser(session: SessionHandoff): void   // synchronous, idempotent
genuin.logout(): void                            // existing; used for the clear path
```

Behavior:

- Validate `session.user` + `accessToken` (reuse `isValidToken` for the token).
- `TokenManager.setSession(session)` (§2).
- Emit `SDK_AUTHENTICATE_USER` with the parsed user (live embeds re-render).
- If SDK not yet initialized, **queue `setUser` itself** on the existing
  `callbackQueueManager` (same pattern as `newUpdate`, `genuin-sdk.ts:307`) so a `setUser`
  before `init` still applies once init completes.
- **No network call** anywhere in this path.

### §2 — `TokenManager.setSession` (zero-API core)

Add to `packages/web-sdk/src/core/token-manager.ts`:

```ts
setSession({ user, accessToken, refreshToken }: SessionHandoff): void {
  const authUser: AuthUser = {
    ...user,
    accessToken,
    refreshToken,
    autoLoginToken: accessToken,   // makes token-match cache-hit work if a token IS later passed
  };
  this.cachedUser = authUser;      // in-memory -> used by the render pass
  this.setUserData(authUser);      // writes genuin-user-data (localStorage OR iframe internalStorage)
}
```

Setting `autoLoginToken = accessToken` keeps decision (6) intact. The primary zero-API
path (decision 7) does not even rely on it, because WebApp calls `init({})` with no token.

### §3 — Cold-start else-branch: precedence token > cached user, no blind wipe

Replace `genuin-sdk.ts:449-459` with:

```ts
if (this.isValidToken(config.token)) {
  // token wins - ignore cached user, authenticate from token.
  // getCurrentUser still skips /sso/autologin when stored autoLoginToken === token.
  user = (await this.authenticateUser({ token: config.token, userParams: config.params })) ?? undefined;
} else {
  // no token - fall back to cached user; only clear when none exists.
  const cached = this.tokenManager.getCachedUser() ?? this.tokenManager.getUserData();
  if (cached) {
    user = cached; // zero-API restore of a setUser() seed
  } else {
    this.tokenManager.removeUserData(); // nothing to keep - safe to clear
    user = null;
  }
}
```

Standalone embed with no seed and no token still renders logged-out (unchanged behavior)
— but without needlessly wiping.

### §4 — Live lifecycle sync

Cross-bundle bus already in place (`SDKEventEmitter` ↔ `window.genuin.emitInternal/onInternal`).

- **Login / already-logged-in / account-switch:** WebApp → `genuin.setUser(...)` →
  `TokenManager.setSession` → emit `SDK_AUTHENTICATE_USER` → SDK `AuthProvider` handler
  (`provider.tsx:123-134`) sets `authenticatedUser`. The token reaches axios **indirectly**:
  the `authenticatedUser`-watching `useLayoutEffect` (`provider.tsx:164-184`) fires and calls
  `axiosRegistry.setAuthTokenOnAll(token)` + invalidates queries. The handler itself does NOT
  call `setAuthTokenOnAll` (verified) and does **not** need to — no change required here.
- **Logout:** WebApp → `genuin.logout()` → existing `clearAuth()` + emit `SDK_LOGOUT_USER`
  → handler (`provider.tsx:136`) sets user null + `axiosRegistry.clearAuthTokenFromAll()`.
- **Token refresh:** ALREADY handled inside 2.0.6 `AuthProvider` response interceptor
  (`provider.tsx:342-389`): 401 → `performTokenRefresh` (`token-refresh.ts`) →
  `emitCachedUserUpdateEvent(updatedUser)` → SDK `TokenManager` `CACHED_USER_UPDATE`
  listener (`token-manager.ts:56`) → `setUserData` + `axiosRegistry.setAuthTokenOnAll`.
  **No `use-refresh-token.ts` change** (that hook is dead), **no new refresh code**.

### §5 — WebApp call sites

- `apps/webapp/src/components/providers/auth-bridge.tsx` already holds the NextAuth `user`
  and a `mapKsCbStatus` helper. Add:
  - An effect: when `session.user` is present → `window.genuin?.setUser({ user: mapToAuthUser(session.user), accessToken, refreshToken })`. Guard that `window.genuin` may not exist yet (SDK script async); the SDK-side `setUser`-before-init queue (§1) covers ordering, and the effect re-runs on session change.
  - `onSignOut` → add `window.genuin?.logout()` alongside the existing NextAuth `signOut`.
    (Do not add/keep any Zustand `genuin-options` clearing — that store is old flow.)
- `mapToAuthUser` mapper (NextAuth user → SDK `AuthUser`; reconcile `ksCbRequestStatus`
  number vs enum) in its **own utility file** (e.g. `apps/webapp/src/lib/utils/map-to-auth-user.ts`),
  imported by `auth-bridge.tsx`. Not inline.
- No refresh call site (see §4).

### §6 — Token/backend caveat, version gap, testing, guardrails

- **Backend token caveat (go/no-go, verify before prod):** zero-API means the SDK never
  calls `/sso/autologin`, so it never receives an SDK-minted token — it uses the WebApp
  accessToken for SDK API calls (feed/comments/video via `axiosRegistry`). **Verify one
  authed SDK endpoint succeeds with the WebApp bearer.** If the backend requires an
  SDK-specific token, zero-API is not achievable without one autologin (would revisit
  decision 1).
- **Version gap:** WebApp loads hosted **v2.0.5**; changes land in **2.0.6**. Effect only
  after the hosted bundle is rebuilt and the pin in `genuin-sdk-loader.tsx` (`SDK_VERSION`)
  is bumped. Rollout step.
- **Testing:**
  - Unit (web-sdk): `TokenManager.setSession` seeds cache + storage and makes **no** fetch;
    `setUser` before `init` queues then applies; empty-`init` else-branch restores a seed
    (not wipes) and still nulls when no seed; token-present path prefers token over cache.
  - Unit (components): `AUTHENTICATE_USER`/`LOGOUT_USER` handlers update state + axios token.
  - Integration (webapp): mock `window.genuin`; assert `auth-bridge` effect calls
    `setUser` on login and `logout` on sign-out; assert `mapToAuthUser` field mapping.
  - E2E (optional): login in WebApp → embed shows authed → network tab shows **no**
    `/sso/autologin`.
- **Guardrails (CLAUDE.md):** public SDK API addition + shared `packages/components` change
  affect both webapp and web-sdk → **requires team approval**. Auth-adjacent change → flag
  for security review of token handling (tokens remain in JS-readable storage — pre-existing).

## Files touched (summary)

- `packages/web-sdk/src/index.ts` — expose `setUser` on `window.genuin` + static.
- `packages/web-sdk/src/loader.js` — `setUser` loader wrapper + init queue support.
- `packages/web-sdk/src/sdk/genuin-sdk.ts` — `setUser` method (+ queue), §3 else-branch fix.
- `packages/web-sdk/src/core/token-manager.ts` — `setSession`.
- `packages/web-sdk/src/type.ts` — `SessionHandoff` type.
- `packages/components/src/types/genuin-sdk.d.ts` — declare `setUser` on the genuin global.
- `apps/webapp/src/components/providers/auth-bridge.tsx` — call sites (setUser/logout).
- `apps/webapp/src/lib/utils/map-to-auth-user.ts` — new `mapToAuthUser` util.
- `packages/components/src/context/auth/provider.tsx` — **no change** (axios token already
  set by the `authenticatedUser` effect on the event path).

## Resolved

- Queue **`setUser` itself** on `callbackQueueManager` pre-init.
- `AUTHENTICATE_USER` handler does NOT (and need not) call `setAuthTokenOnAll`; the
  `authenticatedUser` effect (`provider.tsx:164-184`) already sets the axios token. No change.
- `mapToAuthUser` lives in its own util file, imported by `auth-bridge.tsx`.
- WebApp accessToken used as-is; no extra backend pre-check required per user.

## Open items for the plan

- Confirm exact `callbackQueueManager.enqueue` signature for queuing `setUser` pre-init.
- Finalize the `ksCbRequestStatus` number↔enum mapping in `mapToAuthUser`.
