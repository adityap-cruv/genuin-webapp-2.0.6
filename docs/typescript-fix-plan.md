# TypeScript Error Fix Plan

> **Scope**: `packages/ui`, `packages/components`, `packages/web-sdk`
> **Excludes**: `apps/webapp`, `apps/legacy-webapp`
> **Total errors**: ~475 (source files) + ~140 (story/test files) + 1 (web-sdk)
> **Generated**: 2026-04-15

---

## Overview

| Phase                                                   | Focus                                    | Package(s)         | Error Count | Risk   |
| ------------------------------------------------------- | ---------------------------------------- | ------------------ | ----------- | ------ |
| [Phase 1](#phase-1-missing-exports--module-resolution)  | Missing exports & module resolution      | `components`, `ui` | ~15         | Low    |
| [Phase 2](#phase-2-analytics-type-gaps)                 | Analytics event type gaps                | `components`       | 2           | Low    |
| [Phase 3](#phase-3-incorrect-function-signatures)       | Wrong function argument counts           | `components`       | ~10         | Low    |
| [Phase 4](#phase-4-simple-type-narrowing--guards)       | Branded types, literal string mismatches | `components`, `ui` | ~30         | Low    |
| [Phase 5](#phase-5-undefined-guards--optional-chaining) | `possibly 'undefined'` (TS18048)         | `components`       | ~336        | Medium |
| [Phase 6](#phase-6-story--test-file-type-fixes)         | Story/test file type errors              | `components`, `ui` | ~140        | Low    |
| [Phase 7](#phase-7-web-sdk-specific-errors)             | web-sdk module resolution                | `web-sdk`          | 1           | Low    |

Work through phases in order — later phases depend on type fixes from earlier ones.

---

## Phase 1 — Missing Exports & Module Resolution

**Error codes**: TS2305, TS2307
**Estimated errors fixed**: ~15

### 1.1 — `ReadMoreTextType` not exported

**File**: `packages/components/src/molecules/read-more/index.ts` (or source file)
**Consumer**: `packages/components/src/organisms/generic-details/generic-details.type.ts:2`

```
error TS2305: Module '"@genuin/components/molecules/read-more"' has no exported member 'ReadMoreTextType'.
```

**Fix**: Find where `ReadMoreTextType` is defined and add it to the public export.

```ts
// packages/components/src/molecules/read-more/index.ts
export type { ReadMoreTextType } from "./read-more"; // add this export
```

---

### 1.2 — `GenericDetailsSkeleton` not exported

**Consumer**: unknown — search for the import site.

```bash
grep -r "GenericDetailsSkeleton" packages/components/src --include="*.ts" --include="*.tsx"
```

**Fix**: Export `GenericDetailsSkeleton` from the file where it is defined.

---

### 1.3 — `ParsedVideoType` not exported

Same pattern — find definition, add export.

```bash
grep -r "ParsedVideoType" packages/components/src --include="*.ts" --include="*.tsx"
```

---

### 1.4 — TanStack Query re-exports (`InfiniteData`, `UseInfiniteQueryResult`)

**Error**: `Module '"@tanstack/react-query"' has no exported member 'InfiniteData'`

These were renamed in TanStack Query v5. Check current package version:

```bash
cat packages/components/package.json | grep tanstack
```

**Fix (TanStack Query v5)**:

```ts
// Before
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

// After — these are exported from v5, but verify exact names:
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
```

If the import path is wrong (e.g. a local barrel), fix the barrel file to re-export them.

---

### 1.5 — `XIconProps` not in `@genuin/ui/icons`

**File**: `packages/components/src/molecules/search-input/search-input.tsx:2`

```
error TS2305: Module '"@genuin/ui/icons"' has no exported member 'XIconProps'.
```

**Fix option A** — Export from icons:

```ts
// packages/ui/src/icons/index.ts
export type { XIconProps } from "./x-icon"; // or wherever XIcon is defined
```

**Fix option B** — Use a broader type from the icon component:

```ts
import type { SVGProps } from "react";
type XIconProps = SVGProps<SVGSVGElement>;
```

---

### 1.6 — `@storybook/react` module not found in `packages/ui`

**Files**:

- `packages/ui/src/components/radio-input/radio-input.stories.tsx:1`
- `packages/ui/src/components/tabs/tabs.stories.tsx:1`

```
error TS2307: Cannot find module '@storybook/react' or its corresponding type declarations.
```

**Fix**: Add `@storybook/react` to `packages/ui/package.json` devDependencies.

```bash
cd packages/ui && pnpm add -D @storybook/react
```

---

### 1.7 — Missing module `src/react-query/api/comments`

**File**: `packages/components/src/molecules/comments/comment-item.tsx:4`

```
error TS2307: Cannot find module 'src/react-query/api/comments'
```

**Fix**: Change the import to a relative path or the correct alias:

```ts
// Before
import { ... } from 'src/react-query/api/comments';

// After
import { ... } from '../../react-query/api/comments';
// or
import { ... } from '@genuin/components/react-query/api/comments';
```

---

## Phase 2 — Analytics Type Gaps

**Error codes**: TS2740, TS2345
**Estimated errors fixed**: 2
**Files**:

- `packages/components/src/context/analytics/emit-analytics-data.ts:16`
- `packages/components/src/context/analytics/provider.tsx:264`

### 2.1 — `EmitAnalyticsDataType` is missing 19+ event entries

```
error TS2740: Type '{ ... 59 entries ... }' is missing the following properties from type 'EmitAnalyticsDataType':
"SDK Performance", "Ad Started", "Ad Completed", "Ad CTA Clicked", and 19 more.
```

The `ANALYTICS_EVENTS` object in `emit-analytics-data.ts` is missing event definitions that are listed in the `EmitAnalyticsDataType` interface.

**Fix**: Add the missing event entries to the object literal. Run tsc to get the full list:

```bash
cd packages/components && pnpm tsc --noEmit 2>&1 | grep "emit-analytics-data"
```

For each missing key (e.g. `"SDK Performance"`, `"Ad Started"` etc.), add a matching entry:

```ts
"SDK Performance": {
  canFire: true,
  allowed_keys: ['duration_ms', 'sdk_version'],
  description: 'Fired when SDK performance metrics are collected',
},
"Ad Started": {
  canFire: true,
  allowed_keys: ['ad_id', 'placement_id'],
  description: 'Fired when an ad starts playing',
},
// ... remaining missing events
```

Alternatively, if these events should not be fired from components, update `EmitAnalyticsDataType` to only include the events that are actually implemented.

---

### 2.2 — Analytics `emitAnalyticsData` call missing `axiosInstance`

**File**: `packages/components/src/context/analytics/provider.tsx:264`

```
error TS2345: Argument of type '{ eventName: "Video Mark Complete"; payload: {...}; }'
is not assignable to parameter of type '{ eventName: string; payload: ...; axiosInstance: AxiosInstance; }'.
```

**Fix**: Pass `axiosInstance` to the call:

```ts
// provider.tsx ~line 264
emitAnalyticsData({
  eventName: 'Video Mark Complete',
  payload: { ... },
  axiosInstance,  // <-- add this
});
```

Ensure `axiosInstance` is available in scope (injected via context or prop).

---

## Phase 3 — Incorrect Function Signatures

**Error codes**: TS2554 (wrong number of arguments)
**Estimated errors fixed**: ~10

### 3.1 — `linkouts/utils.ts` — called with 1 arg, expects 2

**File**: `packages/components/src/molecules/linkouts/utils.ts:10`
**Fix**: Check the function signature and either add the missing argument at the call site, or make the parameter optional in the function definition if it is truly optional.

---

### 3.2 — `add-linkout-form.tsx` — called with 2 args, expects 3

**File**: `packages/components/src/organisms/add-linkout-form/add-linkout-form.tsx:116`
**Fix**: Same approach — pass the missing argument or mark the parameter as optional.

---

### 3.3 — `image-cropper.tsx` — called with 2 args, expects 3

**File**: `packages/components/src/organisms/image-cropper/image-cropper.tsx:75`
**Fix**: Same as above.

---

### 3.4 — `otp-verfication-delete-account.tsx` — called with 0 args, expects 1

**File**: `packages/components/src/organisms/authentication-modal/screens/otp/otp-verfication-delete-account.tsx:125`
**Fix**: Pass the required argument, or make it optional if that matches the intent.

---

## Phase 4 — Simple Type Narrowing & Literal Mismatches

**Error codes**: TS2322, TS2345 (type assignability)
**Estimated errors fixed**: ~30

### 4.1 — `join_group` action not in union type

**File**: `packages/components/src/molecules/join-group-button/join-group-button.tsx:95`

```
error TS2322: Type '"join_group"' is not assignable to type '"video" | "subscribe" | "join_as_collaborator" | ...'.
```

**Fix**: Add `"join_group"` to the action union type definition.

```ts
// Wherever the action type is defined, e.g. types.ts
type ActionType =
  | "video"
  | "subscribe"
  | "join_as_collaborator"
  | "join_community"
  | "comment"
  | "repost"
  | "spark"
  | "report"
  | "get_app"
  | "join_group"; // <-- add this
```

---

### 4.2 — `profile-link.tsx` — `string | undefined` passed where `string` expected

**File**: `packages/components/src/molecules/profile-link/profile-link.tsx:35`

```
error TS2322: Type 'string | undefined' is not assignable to type 'string | (string & UrlObject)'.
```

**Fix**: Add a null-coalescing fallback or a guard:

```ts
// Before
href={someValue}

// After
href={someValue ?? ''}
// or guard the render:
if (!someValue) return null;
```

---

### 4.3 — `file-select-dropzone.tsx` — `string | undefined` passed to `string` param

**File**: `packages/components/src/molecules/file-select-dropzone/file-select-dropzone.tsx:67`

**Fix**: Assert non-null or guard:

```ts
// Before
someFunction(maybeString);

// After — if you're confident it's defined at this point:
someFunction(maybeString!);
// or — safer:
if (maybeString) someFunction(maybeString);
```

---

### 4.4 — `create-post.tsx` — `string | null` not assignable to `SetStateAction<null>`

**File**: `packages/components/src/organisms/create-post/create-post.tsx:470`

**Fix**: The state type is likely too narrow. Widen the state type:

```ts
// Before
const [value, setValue] = useState<null>(null);

// After
const [value, setValue] = useState<string | null>(null);
```

---

### 4.5 — `create-post.tsx` — `PostData | undefined` not assignable to `PostData`

**Files**: `create-post.tsx:549`, `create-post.tsx:703`

**Fix**: Add a guard before use or use non-null assertion if the logic guarantees it is defined:

```ts
// Option A — guard
if (!postData) return;
// use postData below

// Option B — non-null assertion (only if logic guarantees it)
const data = postData!;
```

---

### 4.6 — `player-swiper` — `(prev: any) => any` not assignable to `Record<number, any>`

**Files**:

- `packages/components/src/organisms/player-swiper/non-sectioned-content.tsx:81`
- `packages/components/src/organisms/player-swiper/sectioned-content.tsx:107`

The setState call is passing a function but the state type is `Record<number, any>` (not a function-accepting overload).

**Fix**: Type the state properly:

```ts
// Before (wrong — treated as Record, not a function)
setState((prev: any) => ({ ...prev, [key]: value }));

// After — type the state as a Record so React infers the function form
const [state, setState] = useState<Record<number, SomeType>>({});
// The callback form then works automatically
```

---

### 4.7 — `embed-tile.tsx` — `Partial<Record<StatsKeyType, ...>>` mismatch

**File**: `packages/components/src/organisms/embed-tile/embed-tile.tsx:485`

```
error TS2322: Type '{ Comments?: ...; Reactions?: ...; Views?: ...; }'
is not assignable to type 'Partial<Record<StatsKeyType, number | { value: number; icon?: ReactNode; }>>'.
```

The value type inside the record uses `{ value: number | undefined; icon: JSX.Element }` but the type expects `number | { value: number; icon?: ReactNode }`.

**Fix**:

```ts
// Ensure value is number (not number | undefined) and icon is optional:
{
  Comments: comments !== undefined ? { value: comments, icon: <CommentsIcon /> } : undefined,
  Reactions: reactions !== undefined ? { value: reactions, icon: <ReactionsIcon /> } : undefined,
  Views: views !== undefined ? { value: views, icon: <ViewsIcon /> } : undefined,
}
```

---

### 4.8 — `search-results/profiles-tab.tsx` — `MemberDataType` shape mismatch

**File**: `packages/components/src/organisms/search-modal/screen/search-results/tabs/profiles-tab.tsx:60`

```
error TS2322: Type '{ brand: { brand_id: number; brand_slug: string; brand_user_logo: number; } | undefined; ... }'
is not assignable to type 'MemberDataType'.
```

The API response shape has `brand_user_logo: number` but `MemberDataType` expects a different shape.

**Fix option A** — Update `MemberDataType` to match the actual API response.
**Fix option B** — Map/transform the API response before passing to the component.

---

### 4.9 — `authentication-modal` — `"USERNAME_INPUT"` not in `StepsType`

**File**: `packages/components/src/organisms/authentication-modal/screens/guidelines/guidelines.tsx:47`

**Fix**: Add `"USERNAME_INPUT"` to `StepsType`:

```ts
type StepsType = "..." | "..." | "USERNAME_INPUT";
```

Or if the step name has been renamed, update the call site.

---

### 4.10 — `authentication-modal` — missing `isUpdate` in `SendOtpProps`

**File**: `packages/components/src/organisms/authentication-modal/screens/edit-phone-number/edit-phone-number.tsx:73`

```
error TS2345: Argument of type '{ phoneNumber: string; isUpdate: true; }' is not assignable to 'SendOtpProps'.
```

**Fix**: Add `isUpdate?: boolean` to `SendOtpProps`:

```ts
interface SendOtpProps {
  phoneNumber: string;
  isUpdate?: boolean; // <-- add this
}
```

---

### 4.11 — `create-post.tsx` — `description_text` property does not exist

**File**: `packages/components/src/organisms/create-post/create-post.tsx:438`

```
error TS2339: Property 'description_text' does not exist on type '{}'.
```

The object is typed as `{}`. Widen the type:

```ts
// Before
const postPayload: {} = {};

// After — define an interface or use a more specific type
interface PostPayload {
  description_text?: string;
  // ... other fields
}
const postPayload: PostPayload = {};
```

---

### 4.12 — `create-post.tsx` — missing `videoType` in `MentionInputProps`

**File**: `packages/components/src/organisms/create-post/create-post.tsx:570`

```
error TS2741: Property 'videoType' is missing in type '{ ... }' but required in type 'MentionInputProps'.
```

**Fix**: Pass `videoType` to the component:

```tsx
<MentionInput
  // ... existing props
  videoType={videoType}
/>
```

Or make `videoType` optional in `MentionInputProps` if it is not always required.

---

### 4.13 — `create-post.tsx` / `edit-video-trim.tsx` — `PostData` shape mismatch

**Files**: `create-post.tsx:549`, `edit-video-trim.tsx:198`

The inferred type of `PostData` at these locations diverges from the declared type. This likely means the API response type in `packages/components/src/react-query/api/profile/posts/types.ts` doesn't match what's being passed.

**Fix**: Run tsc on the types file first and fix any errors there — this will cascade to fix the usage sites.

```bash
cd packages/components && pnpm tsc --noEmit 2>&1 | grep "react-query/api/profile/posts"
```

---

### 4.14 — `recents.tsx` — `number` passed instead of `AxiosInstance`

**File**: `packages/components/src/organisms/search-modal/screen/recents/recents.tsx:138,158,178`

```
error TS2345: Argument of type 'number' is not assignable to parameter of type 'AxiosInstance'.
```

The function call is passing a numeric ID where an Axios instance is expected. This looks like a wrong argument order.

**Fix**: Check the function signature and reorder arguments, or pass the correct `axiosInstance`:

```ts
// Likely the axiosInstance comes from context
const { axiosInstance } = useAxios();
deleteRecent(axiosInstance, itemId); // not deleteRecent(itemId, axiosInstance)
```

---

### 4.15 — `replaceAll` not supported in target lib (TS2550)

**File**: `packages/components/src/context/url-params-resolver/provider.tsx:1035`

```
error TS2550: Property 'replaceAll' does not exist on type 'string'. Try changing lib to 'es2021' or later.
```

**Fix**: Update the `lib` in `packages/components/tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["ES2021", "DOM", "DOM.Iterable"]
  }
}
```

Or use `split().join()` as a fallback if the tsconfig cannot be changed:

```ts
// Before
str.replaceAll("foo", "bar");

// After (ES2019 compatible)
str.split("foo").join("bar");
```

---

## Phase 5 — Undefined Guards & Optional Chaining

**Error code**: TS18048 (`possibly 'undefined'`)
**Estimated errors fixed**: ~336
**Strategy**: The vast majority of these are in the `feed-player` domain where `postDetails.video` may be `undefined`. Fix the root-level type guard/early return once, and most cascade errors disappear.

> **Important**: Before adding dozens of `?.` operators, check whether the `video` property should actually be required on the type. If it is always present at these call sites, make it required in the type and eliminate the optionality at the type level. Optional chaining should be a last resort, not the default fix.

---

### 5.1 — `post-details/owner-info.tsx` (10 errors)

**File**: `packages/components/src/organisms/post-details/owner-info.tsx:18-31`

All errors reference `owner` being possibly `undefined`. The component probably receives `owner` as an optional prop.

**Fix A — guard at component level** (preferred):

```tsx
// owner-info.tsx
interface OwnerInfoProps {
  owner?: OwnerType;
}

function OwnerInfo({ owner }: OwnerInfoProps) {
  if (!owner) return null; // single guard, all 10 errors disappear
  // rest of component uses owner safely
}
```

**Fix B — make owner required** (if caller always passes it):

```ts
interface OwnerInfoProps {
  owner: OwnerType; // remove the ?
}
```

---

### 5.2 — `post-details/post-details.tsx` (5 errors)

**File**: `packages/components/src/organisms/post-details/post-details.tsx:49-62`

All reference `video` possibly undefined.

**Fix**:

```tsx
function PostDetails({ postDetails }: PostDetailsProps) {
  const { video } = postDetails;
  if (!video) return null; // single guard
  // use video safely below
}
```

---

### 5.3 — `post-side-panel/post-side-panel.tsx` (5 errors)

**File**: `packages/components/src/organisms/post-side-panel/post-side-panel.tsx:59-63`

References `postDetails.video`, `postDetails.group`, `postDetails.community`.

**Fix**:

```tsx
const { video, group, community } = postDetails;
if (!video || !group || !community) return null;
```

Or use optional chaining if partial rendering is acceptable:

```tsx
const videoId = postDetails.video?.id;
```

---

### 5.4 — `group-posts/group-posts.tsx` (8 errors)

**File**: `packages/components/src/organisms/group-posts/group-posts.tsx:74-111`

All reference `post.video` possibly undefined in a list.

**Fix**:

```tsx
// Filter at the top of the render or in the query transformation
const postsWithVideo = posts.filter((post): post is PostWithVideo => post.video !== undefined);
// use postsWithVideo below
```

Or guard per-item inside the map:

```tsx
{
  posts.map((post) => {
    if (!post.video) return null;
    return <PostItem key={post.video.id} video={post.video} />;
  });
}
```

---

### 5.5 — `hooks/embed/use-iheart-url-manager.ts` (3 errors)

**File**: `packages/components/src/hooks/embed/use-iheart-url-manager.ts:35-36`

```
error TS18048: 'video.video' is possibly 'undefined'.
```

**Fix**: Guard before accessing nested `video.video`:

```ts
const innerVideo = video.video;
if (!innerVideo) return;
// use innerVideo safely
```

---

### 5.6 — `feed-player` domain (~280 errors in 9 files)

The dominant source of TS18048 errors. All are in:

- `control-layer/expand-view/expand-view-details.tsx` (56)
- `control-layer/embed/iheart/iheart-embed.tsx` (47)
- `pills/community-hover-card.tsx` (23)
- `pills/community-pill/community-pill.tsx` (20)
- `control-layer/default.tsx` (19)
- `control-layer/embed/iheart/use-iheart-playback.ts` (16)
- `pills/group-pill/group-pill.tsx` (15)
- `pills/group-hover-card.tsx` (15)
- `control-layer/placement/default-placement.tsx` (14)
- `control-layer/embed/iheart/clip-player-cta.tsx` (14)
- `control-layer/embed/iheart/controls.tsx` (9)

**Root cause**: `PostDetailsType.video` (and nested fields) are marked optional (`video?: VideoType`), but these components use them without guards.

**Recommended approach**:

**Step 1** — Check if `video` should really be optional in `PostDetailsType`. If not, make it required.

**Step 2** — If it must stay optional, add a single early return at the top of each component:

```tsx
// expand-view-details.tsx
function ExpandViewDetails({ postDetails }: Props) {
  const { video } = postDetails;
  if (!video) return null; // single guard eliminates ~56 errors
  // access video freely below
}
```

**Step 3** — For components that use `postDetails.video.someNestedField`, similarly check each nesting level once:

```tsx
const { video } = postDetails;
if (!video) return null;

const { embed } = video;
if (!embed) return null;
```

**Step 4** — For hooks (not returning JSX), return early or return a default value:

```ts
// use-iheart-playback.ts
if (!video) return defaultPlaybackState;
```

---

## Phase 6 — Story & Test File Type Fixes

**Estimated errors fixed**: ~140
**Risk**: Very low — these are isolated to development files, not runtime code.

### 6.1 — `packages/ui` story files

#### 6.1.1 — `accordion.stories.tsx` — `openIcon`/`closedIcon` props removed

The `AccordionTrigger` component replaced `openIcon`/`closedIcon` with a single `openCloseIcon` prop.

**Fix** (`packages/ui/src/components/accordion/accordion.stories.tsx:194,216`):

```tsx
// Before
<AccordionTrigger openIcon={<ChevronDown />} closedIcon={<ChevronRight />}>

// After
<AccordionTrigger openCloseIcon={<ChevronDown />}>
```

---

#### 6.1.2 — `button.test.tsx` — invalid `"default"` size value

**File**: `packages/ui/src/components/button/button.test.tsx:21,32`

```
error TS2322: Type '"default"' is not assignable to type '"xs" | "sm" | "md" | "lg" | "xl"'.
```

**Fix**:

```tsx
// Before
<Button size="default">

// After — use a valid size
<Button size="md">
```

---

#### 6.1.3 — `dialog.stories.tsx` — missing required `type` prop

**File**: `packages/ui/src/components/dialog/dialog.stories.tsx:122`

**Fix**: Add the required `type` prop to the story:

```tsx
<DialogFooter type="default">{children}</DialogFooter>
```

---

#### 6.1.4 — `form.stories.tsx` — missing React import (UMD global)

**File**: `packages/ui/src/components/form/form.stories.tsx:146`

```
error TS2686: 'React' refers to a UMD global, but the current file is a module.
```

**Fix**: Add the import:

```ts
import React from "react";
```

---

#### 6.1.5 — `phone-input.stories.tsx` — `E164Number` branded string

**File**: `packages/ui/src/components/phone-input/phone-input.stories.tsx:25,40,54,69,81,96`

```
error TS2322: Type 'string' is not assignable to type 'string & { __tag: "E164Number"; }'.
```

**Fix**: Cast to the branded type in the story data:

```ts
import type { E164Number } from "libphonenumber-js";

// Before
value: "+15551234567";

// After
value: "+15551234567" as E164Number;
```

---

#### 6.1.6 — `tooltip.stories.tsx` — invalid variant strings

**File**: `packages/ui/src/components/tooltip/tooltip.stories.tsx:64,77,87,97,127,142`

Variants `"outline"`, `"secondary"`, `"link"`, `"destructive"` are used but not in the current `"default" | "icon" | "rounded"` union.

**Fix option A** — Remove the invalid story variants (they test non-existent states).
**Fix option B** — Add the variants back to the `Button` component if they were removed by accident.

Verify the `Button` component to determine which variants are intended:

```bash
grep -n "variant" packages/ui/src/components/button/button.tsx
```

---

#### 6.1.7 — `tabs.stories.tsx` — implicit `any` parameter

**File**: `packages/ui/src/components/tabs/tabs.stories.tsx:16`

```
error TS7006: Parameter 'args' implicitly has an 'any' type.
```

**Fix**:

```ts
// Before
const Template = (args) => <Tabs {...args} />;

// After
import type { ComponentProps } from 'react';
const Template = (args: ComponentProps<typeof Tabs>) => <Tabs {...args} />;
```

---

### 6.2 — `packages/components` story files

#### 6.2.1 — `community-card.stories.tsx` (22 errors)

Run tsc and check all errors; most are likely `GuidelineType` mismatches and `stats` shape issues. Fix by aligning story mock data to the current type definitions.

```bash
cd packages/components && pnpm tsc --noEmit 2>&1 | grep "community-card.stories"
```

---

#### 6.2.2 — `side-info.stories.tsx` (12 errors)

Similar — story mock data shape doesn't match current types. Update mock data.

---

#### 6.2.3 — `member-item.stories.tsx` (12 errors)

Update mock data types to match `MemberDataType`.

---

#### 6.2.4 — `test-data-feed.ts` (8 errors)

This test fixture has stale types. Update to match current `PostData` / `FeedType` definitions:

```bash
pnpm tsc --noEmit 2>&1 | grep "test-data-feed"
```

---

#### 6.2.5 — `otp-verification.stories.tsx` (6 errors)

Fix story prop types to match current OTP component API.

---

#### 6.2.6 — Other story files with 2-5 errors each

Remaining story files (`tag`, `category-input`, `stats`, `signin`, `search-modal`, `details-page-topbar`, `video-trim-slider`, `notification-item`, `trending-groups`, `post-origin-card`) need mock data updated to match current type definitions. Use tsc output to identify exactly which props changed.

---

## Phase 7 — web-sdk Specific Errors

**Estimated errors fixed**: 1

### 7.1 — Missing `styles.css` type declarations

**File**: `packages/web-sdk/src/index.ts:6`

```
error TS2307: Cannot find module './styles.css' or its corresponding type declarations.
```

**Fix option A** — Add a CSS module declaration file:

```ts
// packages/web-sdk/src/styles.d.ts
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
```

**Fix option B** — If `styles.css` is not a CSS module but a plain stylesheet, use a side-effect import declaration:

```ts
// packages/web-sdk/src/global.d.ts
declare module "./styles.css";
```

**Fix option C** — Check if `styles.css` actually exists. If not, generate it during the build step or remove the import.

```bash
ls packages/web-sdk/src/styles.css
```

---

## Verification Checklist

After completing each phase, verify with:

```bash
# packages/ui
cd packages/ui && pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

# packages/components
cd packages/components && pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

# packages/web-sdk (own errors only)
cd packages/web-sdk && pnpm tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.\./components\|\.\./ui" | wc -l
```

Expected counts after each phase:

| After Phase | `ui` | `components` (source) | `components` (stories) | `web-sdk` own |
| ----------- | ---- | --------------------- | ---------------------- | ------------- |
| Baseline    | 21   | 336                   | 118                    | 1             |
| Phase 1     | 17   | 325                   | 118                    | 1             |
| Phase 2     | 17   | 323                   | 118                    | 1             |
| Phase 3     | 17   | 313                   | 118                    | 1             |
| Phase 4     | 17   | 280                   | 118                    | 1             |
| Phase 5     | 17   | 0                     | 118                    | 1             |
| Phase 6     | 0    | 0                     | 0                      | 1             |
| Phase 7     | 0    | 0                     | 0                      | 0             |

---

## Quick-win Order (if you want the fastest error reduction)

1. **Phase 5.6 first** — fixing `postDetails.video` guards in `feed-player` eliminates ~280 errors in one pass
2. **Phase 5.1–5.5** — remaining `owner`/`video` undefined guards (~56 more errors)
3. **Phase 4** — type literal/shape mismatches (~30 more)
4. **Phase 1** — missing exports/modules (~15 more)
5. **Phase 6** — story file cleanup (~140 more)
6. **Phases 2, 3, 7** — small targeted fixes (~13 remaining)
