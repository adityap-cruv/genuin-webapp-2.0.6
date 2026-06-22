# GenAI Storybook Plan

This document describes the Storybook setup added to `packages/genai` and the
initial seven stories created for the SDK's primary UI surfaces.

## Why a Storybook in `packages/genai/` (not `packages/components/`)

`packages/genai` is a self-contained, separately-published SDK with its own
build pipeline (Vite + Rollup, IIFE bundle for `<script>` tag distribution),
its own Tailwind config (prefix `gai:`), its own theme tokens, and its own
runtime context tree (`AppProviders` → `AgentsProvider` → `InputProvider`,
plus `OctoAnalytics`).

Bolting genai stories onto `packages/components/.storybook` would mean loading
two Tailwind configs with conflicting prefixes (`gencl:` vs `gai:`) and
plumbing genai-specific contexts into a Storybook that today only knows
about the webapp components. A second Storybook in `packages/genai` keeps
each package's tooling self-contained — same pattern as `packages/web-sdk`.

## Directory layout

```text
packages/genai/
├── .storybook/
│   ├── main.ts             # Storybook config (Vite + addons)
│   ├── preview.tsx         # Global decorators, CSS imports
│   ├── _story-helpers.tsx  # MockAgentsProvider / MockInputProvider
│   └── globals.d.ts        # Vite-style env typings for Storybook
├── tsconfig.storybook.json # tsconfig for storybook compile
└── src/components/**/*.stories.tsx
```

## Mock context strategy

Most genai components depend on `useAgentsContext()`, which is fed by an
`AgentsProvider` that pulls real agents/sessions from the QA backend, opens
SSE streams, and runs analytics. Reproducing that in Storybook would
require live API access and is fragile.

Instead, `_story-helpers.tsx` exports `MockAgentsProvider` and
`MockInputProvider` — thin wrappers that bypass the real providers and write
arbitrary mock values directly into the underlying React contexts. Each story
passes a partial override and a sensible default fills the rest.

This means stories render synchronously, deterministically, and offline.
The trade-off: stories don't exercise the provider logic itself — but
provider behavior is integration-level and belongs in unit/integration
tests, not Storybook.

## Story coverage (initial seven)

| # | Component | File |
| --- | --- | --- |
| 1 | Floating button to open octo/genai | `src/components/FloatingButton.stories.tsx` |
| 2 | List of chats — left side panel | `src/components/Sidebar/Sidebar.stories.tsx` |
| 3 | Button to open the side panel | `src/components/Sidebar/SidebarToggle.stories.tsx` |
| 4 | Message input/send field | `src/components/MessageInput/MessageInput.stories.tsx` |
| 5 | Send / stop-cancel button | `src/components/MessageInput/SendButton.stories.tsx` |
| 6 | Message chat (list of messages) | `src/components/Chat/Chat.stories.tsx` |
| 7 | Skeleton for response generating | `src/components/Chat/ThinkingIndicator.stories.tsx` |

Story 1 wraps the imperative `createFloaterElement(...)` from
`src/styles/floaterStyles.ts` (the SDK has no React floating-button
component — the floater is built directly in DOM by the loader).

Story 5 is not a separate component; it's the send-button portion of
`MessageInput` toggled between idle / sending / disabled by varying
`creatingSession` and `sessions[*].thinking` in the mock context.

Story 3 is the collapsed branch of `Sidebar/index.tsx` — `isSidebarCollapsed:
true` causes `<Sidebar />` to render only the toggle button.

## Running it

```bash
cd packages/genai
pnpm storybook        # dev server, port 6006
pnpm build-storybook  # static build to storybook-static/
```

The dev script reads env vars from the package's `.env.development` so
analytics calls don't blow up.

## Environment variables exposed to Storybook

Storybook's `viteFinal` mirrors the `import.meta.env.VITE_*` keys that
genai's runtime expects:

- `VITE_GENAI_RUDDERSTACK_KEY`, `VITE_GENAI_RUDDERSTACK_URL`
- `VITE_GENAI_API_URL`, `VITE_GENAI_BCC_URL`, `VITE_GENAI_BCC_API_URL`
- `VITE_GENAI_GEN_SDK_URL`, `VITE_GENAI_ASSETS_BASE_URL`
- `VITE_GENAI_API_KEY`, `VITE_GENAI_DS_BACKEND_API_URL`

Stories don't make real network calls (mocks are synchronous), but the
analytics module instantiates `RudderstackProvider` at module import and
throws if `writeKey` is empty — so the env wiring stays.

## Expanded story coverage (round two)

Added stories for the rest of the package's visual surfaces:

| Story | File |
| --- | --- |
| Button (all variants) | `src/components/ui/Button.stories.tsx` |
| Spinner | `src/components/ui/Spinner.stories.tsx` |
| Skeleton | `src/components/ui/Skeleton.stories.tsx` |
| CompactSkeleton | `src/components/ui/CompactSkeleton.stories.tsx` |
| ToggleSwitch | `src/components/ui/ToggleSwitch.stories.tsx` |
| Dialog | `src/components/ui/Dialog.stories.tsx` |
| DropdownMenu | `src/components/ui/DropdownMenu.stories.tsx` |
| Popover | `src/components/ui/Popover.stories.tsx` |
| Select | `src/components/ui/Select.stories.tsx` |
| NewChatDialog | `src/components/ui/NewChatDialog.stories.tsx` |
| Title | `src/components/Title.stories.tsx` |
| AttachmentCard | `src/components/Attachments/AttachmentCard.stories.tsx` |
| EditUserMessage | `src/components/Chat/EditUserMessage.stories.tsx` |
| ThinkingStatusList | `src/components/Chat/ThinkingStatusList.stories.tsx` |
| UploadedFilesList | `src/components/MessageInput/UploadedFilesList.stories.tsx` |
| SidebarItem | `src/components/Sidebar/SidebarItem.stories.tsx` |
| AgentsDropdown (+ skeleton) | `src/components/AgentsDropdown/AgentsDropdown.stories.tsx` |
| AgentsSection (+ skeleton) | `src/components/AgentsSection/AgentsSection.stories.tsx` |
| AgentIntro | `src/components/AgentIntro/AgentIntro.stories.tsx` |
| Objectives | `src/components/Objectives/Objectives.stories.tsx` |
| WebSDK/AgentChips | `src/components/WebSDK/AgentChips.stories.tsx` |

## Deliberately not covered

These need either backend, auth, or a render env that Storybook can't
sensibly reproduce. Each is annotated with the reason:

- `AppContent.tsx` — top-level orchestrator; mounts the entire app tree.
  No useful "isolated" view.
- `GenAiButton.tsx` — empty stub (`return <div></div>`); nothing to render.
- `CarousalLoader.tsx` / `Chat/CarousalEmbed.tsx` — depend on
  `window.genuin` from the prod-loaded `gen_sdk.min.js`.
- `Chat/InventoryWidget.tsx` — backend `inventory/render` call.
- `Chat/KoahAdWidget.tsx` / `Chat/KoahSDKLoader.tsx` — Koah ad SDK; needs
  `VITE_GENAI_KOAH_PUBLISHER_ID` and live ad inventory.
- `Chat/VideoPlayer.tsx`, `Chat/VideoMetadata.tsx` — tightly coupled to
  the Genuin video pipeline; would need full embed wiring.
- `Chat/MessageItem.tsx` (618 lines) — combines markdown rendering,
  streaming animation, edit mode, feedback, video/carousel/inventory/koah
  embeds, BCC widgets. Lower-level pieces are storied individually
  (`AgentTextContent`, `EditUserMessage`, `ThinkingStatusList`).
- `Chat/AgentTextContent.tsx`, `Chat/Markdown.tsx` — the latter is a
  components map (not a React component); the former composes most of the
  BCC widget tree.
- `BCC/*` — admin-side brand-config flows; need auth, BCC API, real
  brand context.
- `WebSDK/CustomInput.tsx`, `WebSDK/WebSDKContent.tsx`,
  `WebSDK/WebSDKInput.tsx`, `WebSDK/WebSDKPresetPrompts.tsx` — depend on
  Lottie remote loading and `useOctoAnalytics()`. `AgentChips` is the
  only standalone WebSDK piece.
- `MessageInput/PromptSuggestions.tsx`, `MessageInput/PresetPrompts/*` —
  identical context-shape to `WebSDKPresetPrompts`; the parent
  `MessageInput` story already exercises both via `suggestedPrompts`.
- `ui/Sonner.tsx` — toast container; only meaningful inside an app where
  `toast.error(...)` is fired from somewhere.
- `ui/AnimatedDialog.tsx` — internal close-animation wrapper; the
  underlying `Dialog` story covers the open/close states.

## Out of scope (for the initial PR)

- Vitest integration via `@storybook/addon-vitest`. The components package
  has it; we can add it later. Not needed to get visual coverage running.
- A11y addon. Worth adding later.
- Chromatic visual-regression wiring. The components package publishes to
  Oracle Cloud — replicate that pattern when the genai team wants
  deployable storybook artifacts.

## Risk notes

- The genai `tailwind.config.ts` uses Tailwind v4 with the `gai:` prefix
  declared in `index.css` via `@import 'tailwindcss' prefix(gai);`.
  Storybook's preview imports `index.css` directly — same path the
  runtime uses — so the prefix is honored without any extra config.
- Several genai contexts (`AgentsProvider` mainly) are 1900+ lines and
  trigger network/effect cascades on mount. Stories must not mount the
  real provider — always use `MockAgentsProvider` from
  `.storybook/_story-helpers.tsx`.
- When the `AgentsContextType` shape changes, `_story-helpers.tsx` will
  need updating. Treat it as a sibling of `src/context/app/types.ts`.
