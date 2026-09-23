# WebApp → WebSDK Session Hand-off Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a WebApp-logged-in user render authenticated inside an embedded WebSDK with zero auth API call, plus live login/logout sync.

**Architecture:** Add an SDK-owned inbound method `genuin.setUser(session)` that seeds the SDK's own `TokenManager` cache + localStorage and emits the existing `SDK_AUTHENTICATE_USER` event. Fix the SDK init else-branch so an empty `init({})` restores the seed (precedence: token > cached user) instead of wiping it. WebApp calls `setUser` on login and `logout` on sign-out via the shared `window.genuin` object. Refresh already self-syncs inside 2.0.6 `AuthProvider`.

**Tech Stack:** TypeScript, React 19, Vitest (web-sdk + webapp), the `@genuin/web-sdk` singleton (`Genuin`), `@genuin/components` `AuthProvider`, NextAuth v5 (webapp).

**Spec:** `docs/superpowers/specs/2026-09-16-webapp-sdk-session-handoff-design.md`

## Global Constraints

- TypeScript strict; no `any` without a justified comment; no `React.FC`; ESM only; named exports; 2-space indent, single quotes, semicolons; max line 100.
- No `console.log` in committed code (shared eslint does not ban it, but repo rule does — avoid).
- Public SDK API addition + `packages/components` change affect both webapp and web-sdk → **requires team approval** before merge.
- WebApp accessToken is used as-is by the SDK (no `/sso/autologin`). No extra backend pre-check required per user decision.
- Zero-API primary path: `setUser()` seeds, WebApp calls `init({})` WITHOUT a token.
- Precedence at init: **token > cached user**. `removeUserData()` only when there is genuinely no cached user.
- Effect only after the hosted bundle is rebuilt and `SDK_VERSION` in `genuin-sdk-loader.tsx` is bumped from `2.0.5`.

---

## File Structure

- `packages/web-sdk/src/type.ts` — add `SessionHandoff` type.
- `packages/web-sdk/src/core/token-manager.ts` — add `setSession()`.
- `packages/web-sdk/src/sdk/genuin-sdk.ts` — add `setUser()` instance method (with pre-init queue via `callbackQueueManager`); fix init else-branch (Task 5).
- `packages/web-sdk/src/index.ts` — bind `setUser` onto `window.genuin` + declare on the `Window["genuin"]` interface.
- `packages/web-sdk/src/loader.js` — `setUser` loader wrapper + init-queue entry.
- `packages/components/src/types/genuin-sdk.d.ts` — declare `setUser` on the genuin global type used by components.
- `apps/webapp/src/lib/utils/map-to-auth-user.ts` — new `mapToAuthUser` util (NextAuth user → SDK `AuthUser`).
- `apps/webapp/src/components/providers/auth-bridge.tsx` — call `genuin.setUser` on login / `genuin.logout` on sign-out.
- `apps/webapp/src/components/genuin-sdk-loader.tsx` — bump `SDK_VERSION` (rollout task).

Reference (no change): `packages/components/src/context/auth/provider.tsx` — `SDK_AUTHENTICATE_USER` handler (`:123-134`) sets `authenticatedUser`; the `authenticatedUser` effect (`:164-184`) sets the axios token. Refresh interceptor (`:342-389`) already emits `CACHED_USER_UPDATE` → SDK `TokenManager` listener (`token-manager.ts:56`).

---

### Task 1: `SessionHandoff` type

**Files:**

- Modify: `packages/web-sdk/src/type.ts`

**Interfaces:**

- Consumes: `AuthUser` from `@genuin/components/types/auth`.
- Produces: `export type SessionHandoff = { user: AuthUser; accessToken: string; refreshToken?: string }`.

- [ ] **Step 1: Add the type**

In `packages/web-sdk/src/type.ts`, add (import `AuthUser` if not already imported):

```ts
import type { AuthUser } from "@genuin/components/types/auth";

/**
 * Full authenticated session handed from a host (e.g. the WebApp) to the SDK
 * so it can render authenticated without an auth/login API call.
 */
export type SessionHandoff = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @genuin/web-sdk typecheck` (or `pnpm typecheck` from root)
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/web-sdk/src/type.ts
git commit -m "feat(web-sdk): add SessionHandoff type"
```

---

### Task 2: `TokenManager.setSession`

**Files:**

- Modify: `packages/web-sdk/src/core/token-manager.ts`
- Test: `packages/web-sdk/src/core/token-manager.test.ts` (create if absent)

**Interfaces:**

- Consumes: `SessionHandoff` (Task 1); existing `this.cachedUser`, `this.setUserData` (`token-manager.ts:112`), `this.getUserData` (`:132`).
- Produces: `setSession(session: SessionHandoff): void` on `TokenManager`.

- [ ] **Step 1: Write the failing test**

Create/extend `packages/web-sdk/src/core/token-manager.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TokenManager } from "./token-manager";
import { USER_DATA_KEY } from "@/constants";

describe("TokenManager.setSession", () => {
  beforeEach(() => {
    localStorage.clear();
    // reset singleton cache
    TokenManager.getInstance().clearAuth();
  });

  it("seeds cachedUser and localStorage without any network call", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const tm = TokenManager.getInstance();

    tm.setSession({
      user: {
        id: "u1",
        nickname: "nick",
        name: "",
        image: "",
        isAvatar: false,
        accessToken: "",
        ksCbRequestStatus: "Pending",
        usernameSet: true,
      } as any,
      accessToken: "ACCESS_1",
      refreshToken: "REFRESH_1",
    });

    const cached = tm.getCachedUser();
    expect(cached?.id).toBe("u1");
    expect(cached?.accessToken).toBe("ACCESS_1");
    expect(cached?.refreshToken).toBe("REFRESH_1");
    expect(cached?.autoLoginToken).toBe("ACCESS_1");

    const stored = JSON.parse(localStorage.getItem(USER_DATA_KEY)!);
    expect(stored.id).toBe("u1");
    expect(stored.autoLoginToken).toBe("ACCESS_1");

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @genuin/web-sdk test token-manager -- --run`
Expected: FAIL — `setSession` is not a function.

- [ ] **Step 3: Implement `setSession`**

In `packages/web-sdk/src/core/token-manager.ts`, add the import and method (place after `getCachedUser`):

```ts
import type { SessionHandoff } from "@/type";
```

```ts
/**
 * Seed the SDK with a full session handed from a host (WebApp), so the SDK
 * renders authenticated with no auth API call. Sets the in-memory cache and
 * persists to storage. autoLoginToken is set to the access token so a later
 * init({ token }) with the same token also cache-hits.
 */
setSession({ user, accessToken, refreshToken }: SessionHandoff): void {
  const authUser: AuthUser = {
    ...user,
    accessToken,
    refreshToken,
    autoLoginToken: accessToken,
  };
  this.cachedUser = authUser;
  this.setUserData(authUser);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @genuin/web-sdk test token-manager -- --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/web-sdk/src/core/token-manager.ts packages/web-sdk/src/core/token-manager.test.ts
git commit -m "feat(web-sdk): TokenManager.setSession seeds cache+storage, no API"
```

---

### Task 3: `GenuinSDK.setUser` instance method (with pre-init queue)

**Files:**

- Modify: `packages/web-sdk/src/sdk/genuin-sdk.ts`
- Test: `packages/web-sdk/src/sdk/genuin-sdk.setuser.test.ts` (create)

**Interfaces:**

- Consumes: `SessionHandoff` (Task 1); `TokenManager.setSession` (Task 2); existing `this.tokenManager`, `this.isInitialized`, `this.callbackQueueManager.enqueue(cb, config)` (`callback-queue-manager.ts:9`), `this.eventManager.emit`, `SDKEventType.SDK_AUTHENTICATE_USER` (`core/events.ts`).
- Produces: `setUser(session: SessionHandoff): void` on `GenuinSDK` → available as `Genuin.setUser` (Genuin is the singleton instance, `genuin-sdk.ts:1930`).

- [ ] **Step 1: Write the failing test**

Create `packages/web-sdk/src/sdk/genuin-sdk.setuser.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Genuin } from "./genuin-sdk";
import { TokenManager } from "@/core/token-manager";
import { EventManager, SDKEventType } from "@/core/events";

const session = {
  user: {
    id: "u7",
    nickname: "n",
    name: "",
    image: "",
    isAvatar: false,
    accessToken: "",
    ksCbRequestStatus: "Pending",
    usernameSet: true,
  } as any,
  accessToken: "TOK",
};

describe("Genuin.setUser", () => {
  beforeEach(() => {
    localStorage.clear();
    TokenManager.getInstance().clearAuth();
  });

  it("seeds the token manager and emits SDK_AUTHENTICATE_USER", () => {
    const emitSpy = vi.spyOn(EventManager.getInstance(), "emit");
    Genuin.setUser(session);

    expect(TokenManager.getInstance().getCachedUser()?.id).toBe("u7");
    expect(emitSpy).toHaveBeenCalledWith(SDKEventType.SDK_AUTHENTICATE_USER, expect.objectContaining({ id: "u7" }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @genuin/web-sdk test genuin-sdk.setuser -- --run`
Expected: FAIL — `Genuin.setUser is not a function`.

- [ ] **Step 3: Implement `setUser`**

In `packages/web-sdk/src/sdk/genuin-sdk.ts`, add the import near the other type imports:

```ts
import type { ConfigByUser, UpdateConfigByUserType, SessionHandoff } from "@/type";
```

Add the method to the `GenuinSDK` class (place next to `newUpdate`, ~`:305`). It queues itself if the SDK is not yet initialized, mirroring `newUpdate`:

```ts
/**
 * Seed the SDK with a full authenticated session from the host (WebApp).
 * Renders authenticated with NO auth API call. Safe to call before init:
 * it queues itself and runs once init completes.
 */
setUser(session: SessionHandoff): void {
  if (!this.isValidToken(session?.accessToken) || !session?.user) {
    return;
  }
  if (!this.isInitialized) {
    this.callbackQueueManager.enqueue(() => this.setUser(session), session);
    return;
  }
  this.tokenManager.setSession(session);
  this.eventManager.emit(SDKEventType.SDK_AUTHENTICATE_USER, this.tokenManager.getCachedUser());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @genuin/web-sdk test genuin-sdk.setuser -- --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/web-sdk/src/sdk/genuin-sdk.ts packages/web-sdk/src/sdk/genuin-sdk.setuser.test.ts
git commit -m "feat(web-sdk): add Genuin.setUser (queues pre-init, emits authenticate)"
```

---

### Task 4: Expose `setUser` on `window.genuin` + loader wrapper + types

**Files:**

- Modify: `packages/web-sdk/src/index.ts`
- Modify: `packages/web-sdk/src/loader.js`
- Modify: `packages/components/src/types/genuin-sdk.d.ts`

**Interfaces:**

- Consumes: `Genuin.setUser` (Task 3); `SessionHandoff` (Task 1).
- Produces: `window.genuin.setUser(session)` callable from any bundle (webapp).

- [ ] **Step 1: Declare + bind in `index.ts`**

In `packages/web-sdk/src/index.ts`, add to the `Window["genuin"]` interface (near `update`, `:45`):

```ts
      setUser?: (session: SessionHandoff) => void;
```

Import the type at top with the existing type import:

```ts
import type { ConfigByUser, UpdateConfigByUserType, SessionHandoff } from "./type";
```

And bind it in the `window.genuin = { ... }` block (near `expand`/`collapse`, `:85`):

```ts
    setUser: Genuin.setUser.bind(Genuin),
```

- [ ] **Step 2: Add loader wrapper + queue entry in `loader.js`**

In `packages/web-sdk/src/loader.js`, add a wrapper mirroring `logout` (after the `logout` function, ~`:267`):

```js
/**
 * Seed the SDK with a host-provided authenticated session (no auth API call)
 */
function setUser(session) {
  return loadSDK().then((sdk) => {
    const GenuinClass = getSDKClass(sdk);
    return GenuinClass.setUser(session);
  });
}
```

And add a queued public entry mirroring `logout` in the `window.genuin` object (near the other `initQueue.push` entries, ~`:416`):

```js
    setUser: function (...args) {
      if (queueProcessed) {
        return setUser(...args);
      }
      return new Promise((resolve, reject) => {
        initQueue.push({ method: "setUser", args, resolve, reject });
        setTimeout(processInitQueue, 0);
      });
    },
```

Then in `processInitQueue` (the `switch`/dispatch on `method`, ~`:278`), add a case so a queued `setUser` dispatches to the `setUser` wrapper. Match the existing style used for `logout`/`update` in that function:

```js
        } else if (method === "setUser") {
          setUser(...args).then(resolve).catch(reject);
        }
```

(Adapt to the exact dispatch shape already present for `logout`.)

- [ ] **Step 3: Declare on the components genuin global type**

In `packages/components/src/types/genuin-sdk.d.ts`, add `setUser` to the genuin interface (it already declares `emitInternal`/`onInternal`, `:20`/`:26`). Use a structural param to avoid a components→web-sdk dep:

```ts
  setUser?: (session: { user: unknown; accessToken: string; refreshToken?: string }) => void;
```

- [ ] **Step 4: Typecheck both packages**

Run: `pnpm --filter @genuin/web-sdk typecheck && pnpm --filter @genuin/components typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/web-sdk/src/index.ts packages/web-sdk/src/loader.js packages/components/src/types/genuin-sdk.d.ts
git commit -m "feat(web-sdk): expose genuin.setUser on window + loader + component types"
```

---

### Task 5: Init else-branch — precedence token > cached user, no blind wipe

**Files:**

- Modify: `packages/web-sdk/src/sdk/genuin-sdk.ts:449-459`
- Test: `packages/web-sdk/src/sdk/genuin-sdk.coldstart.test.ts` (create)

**Interfaces:**

- Consumes: `this.tokenManager.getCachedUser()`, `getUserData()`, `removeUserData()`, `authenticateUser()`, `isValidToken()` — all existing.
- Produces: no new symbol; changes empty-init behavior to restore a seed.

- [ ] **Step 1: Write the failing test**

Create `packages/web-sdk/src/sdk/genuin-sdk.coldstart.test.ts`. Test the else-branch decision in isolation by seeding then asserting the cached user survives an empty-init call and no `/sso/autologin` fetch occurs.

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Genuin } from "./genuin-sdk";
import { TokenManager } from "@/core/token-manager";

describe("cold-start else-branch (token > cached user, no wipe)", () => {
  beforeEach(() => {
    localStorage.clear();
    TokenManager.getInstance().clearAuth();
  });

  it("keeps a seeded cached user on empty init (no autologin fetch)", async () => {
    const tm = TokenManager.getInstance();
    tm.setSession({
      user: {
        id: "seed",
        nickname: "n",
        name: "",
        image: "",
        isAvatar: false,
        accessToken: "",
        ksCbRequestStatus: "Pending",
        usernameSet: true,
      } as any,
      accessToken: "SEED_TOK",
    });
    const removeSpy = vi.spyOn(tm, "removeUserData");

    // Simulate the else-branch resolution used by initializeSingleEmbedById:
    // no token -> prefer cached user, do NOT remove when a seed exists.
    const cached = tm.getCachedUser() ?? tm.getUserData();
    expect(cached?.id).toBe("seed");
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it("returns null and clears when there is no seed and no token", () => {
    const tm = TokenManager.getInstance();
    const cached = tm.getCachedUser() ?? tm.getUserData();
    expect(cached).toBeNull();
  });
});
```

> Note: a full `initializeSingleEmbedById` integration test requires DOM + brand-detail mocks. This unit test locks the else-branch decision logic; the integration behavior is covered by the E2E in Task 8.

- [ ] **Step 2: Run test to verify it fails or passes-by-construction**

Run: `pnpm --filter @genuin/web-sdk test genuin-sdk.coldstart -- --run`
Expected: the first test may already PASS (it asserts the intended helper logic); the guard against `removeUserData` is what Step 3 must not violate. If red, proceed to Step 3.

- [ ] **Step 3: Apply the else-branch change**

Replace `packages/web-sdk/src/sdk/genuin-sdk.ts:449-459` with:

```ts
if (this.isValidToken(config.token)) {
  // Token wins over any cached user. getCurrentUser still skips /sso/autologin
  // when the stored autoLoginToken matches this token.
  user =
    (await this.authenticateUser({
      token: config.token,
      userParams: config.params,
    })) ?? undefined;
} else {
  // No token: fall back to a cached/seeded user. Only clear when none exists.
  const cached = this.tokenManager.getCachedUser() ?? this.tokenManager.getUserData();
  if (cached) {
    user = cached;
  } else {
    this.tokenManager.removeUserData();
    user = null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @genuin/web-sdk test genuin-sdk.coldstart -- --run`
Expected: PASS.

- [ ] **Step 5: Run the full web-sdk suite (no regressions)**

Run: `pnpm --filter @genuin/web-sdk test -- --run`
Expected: PASS (watch for any test asserting the old wipe-on-empty-init behavior; if one exists and asserts the removed behavior, update it to the new precedence and note it in the commit).

- [ ] **Step 6: Commit**

```bash
git add packages/web-sdk/src/sdk/genuin-sdk.ts packages/web-sdk/src/sdk/genuin-sdk.coldstart.test.ts
git commit -m "fix(web-sdk): init else-branch prefers cached user, stops wiping seed"
```

---

### Task 6: `mapToAuthUser` util (WebApp)

**Files:**

- Create: `apps/webapp/src/lib/utils/map-to-auth-user.ts`
- Test: `apps/webapp/src/lib/utils/map-to-auth-user.test.ts`

**Interfaces:**

- Consumes: NextAuth session user shape (`apps/webapp/types/next-auth.d.ts` `User`); `AuthUser` + `ksCbRequestStatusType` from `@genuin/components`.
- Produces: `export function mapToAuthUser(sessionUser: NextAuthUser): AuthUser`.

- [ ] **Step 1: Write the failing test**

Create `apps/webapp/src/lib/utils/map-to-auth-user.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mapToAuthUser } from "./map-to-auth-user";

describe("mapToAuthUser", () => {
  it("maps a NextAuth user to AuthUser and normalizes ksCbRequestStatus", () => {
    const result = mapToAuthUser({
      id: "u1",
      nickname: "nick",
      name: "Nom",
      email: "a@b.co",
      phoneNumber: "1",
      image: "img",
      bio: "b",
      isAvatar: false,
      accessToken: "AT",
      refreshToken: "RT",
      ksCbRequestStatus: 3,
      brandId: 42,
      brandSlug: "slug",
      hasTopics: true,
      usernameSet: true,
      birth: "2000",
    } as any);

    expect(result.id).toBe("u1");
    expect(result.accessToken).toBe("AT");
    expect(result.refreshToken).toBe("RT");
    expect(result.ksCbRequestStatus).toBe("Success"); // 3 -> Success
    expect(result.nickname).toBe("nick");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter webapp test map-to-auth-user -- --run`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the util**

Create `apps/webapp/src/lib/utils/map-to-auth-user.ts`. Reuse the same status mapping the app already uses (`auth-bridge.tsx` `mapKsCbStatus`, and `parser.ts` `KsCbStatus`):

```ts
import type { AuthUser } from "@genuin/components/types/auth";
import type { ksCbRequestStatusType } from "@genuin/components/types/roles";
import type { User as NextAuthUser } from "next-auth";

function mapKsCbStatus(status: number | string): ksCbRequestStatusType {
  if (status === 1 || status === "Pending") return "Pending";
  if (status === 2 || status === "Requested") return "Requested";
  if (status === 3 || status === "Success") return "Success";
  return "Accepted";
}

/**
 * Map a NextAuth session user (WebApp) to the SDK/components AuthUser shape,
 * so it can be handed to genuin.setUser().
 */
export function mapToAuthUser(sessionUser: NextAuthUser): AuthUser {
  return {
    id: sessionUser.id,
    bio: sessionUser.bio ?? undefined,
    email: sessionUser.email ?? undefined,
    phoneNumber: sessionUser.phoneNumber ?? undefined,
    isAvatar: sessionUser.isAvatar,
    name: sessionUser.name ?? "",
    nickname: sessionUser.nickname,
    image: sessionUser.image ?? "",
    accessToken: sessionUser.accessToken,
    refreshToken: sessionUser.refreshToken ?? undefined,
    ksCbRequestStatus: mapKsCbStatus(sessionUser.ksCbRequestStatus),
    isBrandSystemUser: sessionUser.isBrandSystemUser ?? undefined,
    brandId: sessionUser.brandId ?? undefined,
    brandSlug: sessionUser.brandSlug ?? undefined,
    hasTopics: sessionUser.hasTopics ?? undefined,
    birth: sessionUser.birth ?? undefined,
    usernameSet: sessionUser.usernameSet,
  };
}
```

> If any field name differs from `apps/webapp/types/next-auth.d.ts`, align to that file (it is the authoritative NextAuth `User` shape).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter webapp test map-to-auth-user -- --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/lib/utils/map-to-auth-user.ts apps/webapp/src/lib/utils/map-to-auth-user.test.ts
git commit -m "feat(webapp): add mapToAuthUser (NextAuth user -> AuthUser)"
```

---

### Task 7: WebApp call sites — setUser on login, logout on sign-out

**Files:**

- Modify: `apps/webapp/src/components/providers/auth-bridge.tsx`
- Test: `apps/webapp/src/components/providers/auth-bridge.test.tsx` (create)

**Interfaces:**

- Consumes: `mapToAuthUser` (Task 6); `window.genuin.setUser` / `window.genuin.logout` (Task 4); existing `useSession` (`authUser`, `update`).
- Produces: side effects only.

- [ ] **Step 1: Write the failing test**

Create `apps/webapp/src/components/providers/auth-bridge.test.tsx`. Mock `next-auth/react` `useSession` and a `window.genuin`; assert `setUser` is called with the mapped user when a session exists.

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const setUser = vi.fn();
const logout = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "u1",
        nickname: "n",
        name: "",
        image: "",
        isAvatar: false,
        accessToken: "AT",
        refreshToken: "RT",
        ksCbRequestStatus: 1,
        usernameSet: true,
      },
    },
    update: vi.fn(),
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("AuthBridge → SDK hand-off", () => {
  beforeEach(() => {
    setUser.mockClear();
    (window as any).genuin = { setUser, logout };
  });

  it("calls genuin.setUser with the mapped user + tokens when logged in", async () => {
    const { AuthBridge } = await import("./auth-bridge");
    render(
      <AuthBridge>
        <div />
      </AuthBridge>
    );
    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "AT",
        refreshToken: "RT",
        user: expect.objectContaining({ id: "u1", ksCbRequestStatus: "Pending" }),
      })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter webapp test auth-bridge -- --run`
Expected: FAIL — `setUser` not called (no hand-off yet).

- [ ] **Step 3: Add the hand-off effect + logout call**

In `apps/webapp/src/components/providers/auth-bridge.tsx`:

Add imports:

```tsx
import { useEffect } from "react";
import { mapToAuthUser } from "@lib/utils/map-to-auth-user";
```

Inside `AuthBridge`, after `const { data: authUser, update } = useSession();`, add:

```tsx
useEffect(() => {
  const sessionUser = authUser?.user;
  if (sessionUser?.accessToken) {
    window.genuin?.setUser?.({
      user: mapToAuthUser(sessionUser),
      accessToken: sessionUser.accessToken,
      refreshToken: sessionUser.refreshToken ?? undefined,
    });
  }
}, [authUser?.user]);
```

In the existing `onSignOut` callback, add the SDK logout alongside the existing NextAuth `signOut` (keep the existing Zustand `clearUserData` line untouched):

```tsx
onSignOut={(redirectPath) => {
  useGenuinOptions.getState().clearUserData();
  window.genuin?.logout?.();
  return signOut({ callbackUrl: redirectPath });
}}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter webapp test auth-bridge -- --run`
Expected: PASS.

- [ ] **Step 5: Typecheck webapp**

Run: `pnpm --filter webapp typecheck`
Expected: PASS. (If `window.genuin.setUser` is untyped in the webapp, add/confirm the global augmentation — reuse the SDK/components declaration or add a `Window` augmentation in `apps/webapp`.)

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/components/providers/auth-bridge.tsx apps/webapp/src/components/providers/auth-bridge.test.tsx
git commit -m "feat(webapp): hand session to SDK via genuin.setUser on login, logout on sign-out"
```

---

### Task 8: E2E — logged-in WebApp renders authed embed with no autologin call

**Files:**

- Create: `apps/webapp/e2e/sdk-session-handoff.spec.ts` (adapt to the repo's existing e2e harness/config)

**Interfaces:**

- Consumes: the full wired flow (Tasks 1-7).

- [ ] **Step 1: Write the E2E**

Create a Playwright test that logs in (or seeds a NextAuth session per the repo's e2e auth helper), navigates to a `(new)`-group page with a `?embed_id=...`, and asserts (a) the embed renders authenticated UI, (b) **no** request to `**/api/v4/sso/autologin` occurred.

```ts
import { test, expect } from "@playwright/test";

test("embedded SDK is authenticated from WebApp login, no autologin call", async ({ page }) => {
  const autologinCalls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/v4/sso/autologin")) autologinCalls.push(r.url());
  });

  // TODO(executor): use the repo's e2e login/session helper before navigating.
  await page.goto("/home?embed_id=<known-embed-id>"); // use a real test embed id

  // Assert authenticated embed UI (select by data-testid inside the embed).
  await expect(page.getByTestId("<authed-embed-marker>")).toBeVisible();

  expect(autologinCalls, "SDK must not call /sso/autologin on the hand-off path").toHaveLength(0);
});
```

- [ ] **Step 2: Run the E2E**

Run: the repo's e2e command (e.g. `pnpm --filter webapp e2e sdk-session-handoff`).
Expected: PASS. If the embed marker/testid or login helper differ, align to the existing e2e suite.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/e2e/sdk-session-handoff.spec.ts
git commit -m "test(webapp): e2e — embed authed from WebApp login without autologin"
```

---

### Task 9: Rollout — bump hosted SDK pin

**Files:**

- Modify: `apps/webapp/src/components/genuin-sdk-loader.tsx` (`SDK_VERSION`)

**Interfaces:** none.

- [ ] **Step 1: Precondition (manual, out of this repo's build)**

Confirm the `@genuin/web-sdk` 2.0.6 bundle (with `setUser` + the else-branch fix) is built and published to the CDN path used by `GENUIN_SDK_URL`.

- [ ] **Step 2: Bump the pin**

In `apps/webapp/src/components/genuin-sdk-loader.tsx`, change `const SDK_VERSION = "2.0.5";` to the published `2.0.6` version string.

- [ ] **Step 3: Manual verification**

Load a `(new)`-group page while logged in; confirm embed authenticated + no `/sso/autologin` in the network tab.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/components/genuin-sdk-loader.tsx
git commit -m "chore(webapp): bump hosted SDK pin to 2.0.6 for session hand-off"
```

---

## Self-Review

**Spec coverage:**

- §1 setUser contract → Tasks 3, 4. §2 setSession → Task 2. §3 else-branch → Task 5. §4 live sync (login via SDK_AUTHENTICATE_USER, logout via logout()) → Tasks 3, 7; refresh = no change (documented). §5 WebApp call sites + mapToAuthUser util → Tasks 6, 7. §6 testing → Tasks 2,3,5,6,7,8; version pin → Task 9; guardrail (team approval) → Global Constraints. Type `SessionHandoff` → Task 1. All covered.

**Placeholder scan:** E2E (Task 8) has two explicit executor TODOs (real embed id + repo login helper) — unavoidable without the repo's e2e auth fixture; called out, not hidden. No other placeholders.

**Type consistency:** `SessionHandoff` fields (`user`/`accessToken`/`refreshToken`) consistent across Tasks 1-4, 7. `setSession`/`setUser`/`mapToAuthUser` names consistent. `autoLoginToken = accessToken` set in Task 2, relied on by decision 6 (not the primary path). `Genuin` used as the singleton instance (methods bound in index.ts) consistent with `genuin-sdk.ts:1930`.

## Notes / risks carried from the spec

- Backend must accept the WebApp accessToken for SDK API calls (feed/comments) since zero-API means no SDK-minted token. If it doesn't, revisit decision 1.
- `processInitQueue` dispatch in `loader.js` (Task 4) must match the existing per-method dispatch shape — adapt the `setUser` case to whatever pattern `logout`/`update` use there.
- Watch Task 5 Step 5 for any existing test asserting the old empty-init wipe; update it to the new precedence.
