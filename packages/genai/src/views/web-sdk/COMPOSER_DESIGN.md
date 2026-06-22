# Octo Composer — Rewrite Component Design

> Status: **design, not built.** A clean rewrite of the Octo input (web-sdk view), replacing
> `CustomInput.tsx`. Driven by the Figma state frames. **Scope: web-sdk only** (page/dialog/
> floater keep `MessageInput`). The auto-prompt cycle, contexts, and events are unchanged — only
> the input UI + its internals are rewritten.

## Principles

Simple, meaningful, reusable. A small cluster of presentational atoms + one orchestrator.
Each file is a unit a developer opens on its own — no fragmenting one input into 6 files, no
522-line god-component either.

## Design → status model

The Figma frames collapse to **one discriminated union** (the composer's single source of truth).
Focus / line-count are internal UI, not separate states.

```ts
type ComposerStatus =
  | { kind: 'editable' }                                       // Default · Focused · Typing · Typing-Max
  | { kind: 'generating' }                                     // Connecting · Generating (response streaming)
  | { kind: 'suggested'; prompt: string }                      // Auto-prompting (Idea) — "Suggested"
  | { kind: 'countdown'; prompt: string; seconds: number };    // Auto-prompting (Insert) — "Prompting in… N"
```

### Frame → render mapping

| Figma frame | `status.kind` | Surface | Action button |
| --- | --- | --- | --- |
| Default | `editable` | `ComposerInput` — placeholder "Ask anything" | `send` (disabled, empty) |
| Focused | `editable` | `ComposerInput` — focus ring | `send` (disabled) |
| Typing | `editable` | `ComposerInput` — 1 line | `send` |
| Typing-Max | `editable` | `ComposerInput` — **≤8 lines + inner scroll** | `send` |
| Connecting / Generating | `generating` | `ComposerInput` — still typeable | `stop` |
| Auto-prompting (Idea) | `suggested` | `PromptPreview` — "Suggested" label + prompt | `send` |
| Auto-prompting (Insert) | `countdown` | `PromptPreview` — prompt | `countdown` (N) |

The **"Octo Prompt Series"** chips (`Prompting in… N` / `Prompted ✓` / `Paused. Resume`) render
as a **sibling `PromptStatus` above** the composer row (cf. the "Generating…" mockup), fed by the
cycle phase — **not** part of the composer cluster. Owned by `ScrollContent`/panel
(`views/web-sdk/PromptStatus.tsx`). Keeps the composer focused on the input row.

## Component structure (`views/web-sdk/composer/`)

```
composer/
├── PromptComposer.tsx        Orchestrator. Owns text/focus/submit/stop, reads contexts +
│                             auto-prompt props, derives ComposerStatus, lays out the row.
├── ComposerInput.tsx         Editable textarea atom — auto-grow 1→8 lines + inner scroll,
│                             placeholder, focus ring, Enter-submit, arrow-key stopProp.
├── PromptPreview.tsx         Read-only surface — optional "Suggested" label + prompt (clamp).
├── ComposerActionButton.tsx  Morphing button — send | stop | countdown(seconds) + loading.
└── composer-status.ts        ComposerStatus union + deriveComposerStatus() (pure, unit-tested).
```

A `composer/` folder is justified here — a cohesive **reusable widget family**, not arbitrary
ternary-branch splitting. Avatar stays a **plain** small local in `PromptComposer` (single octo
icon, all states).

`PromptStatus.tsx` lives **outside** the composer cluster (sibling, owned by `ScrollContent`/
panel) — the cycle-phase status chips, not an input atom.

Row layout (every status):
```
[ Avatar ] [ ───────── Surface (flex-1) ───────── ] [ ActionButton ]
             editable|generating → <ComposerInput/>
             suggested|countdown → <PromptPreview/>
```

## Reusable atom APIs

```ts
// ComposerInput — the editable surface (the "input box" the design centers on)
interface ComposerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;               // "Ask anything"
  disabled?: boolean;                 // readonly during transitions
  maxLines?: number;                  // default 8 → then inner-scroll
  density: Density;
  onFocus?: () => void;
  onBlur?: () => void;
}
```
Auto-grow (replaces today's fixed `height='28px'` single-line hack): on `value` change reset
`height='auto'`, set `height = min(scrollHeight, maxLines × lineHeight)`, and
`overflowY = scrollHeight > cap ? 'auto' : 'hidden'`. Keep as a tiny local `useAutoGrow(ref,
value, maxLines)` inside this file.

```ts
// PromptPreview — read-only suggested / countdown text
interface PromptPreviewProps {
  prompt: string;
  label?: string;                     // "Suggested"
  density: Density;
}
```

```ts
// ComposerActionButton — one button, three actions
type ComposerAction =
  | { kind: 'send'; disabled?: boolean }
  | { kind: 'stop' }
  | { kind: 'countdown'; seconds: number };

interface ComposerActionButtonProps {
  action: ComposerAction;
  loading?: boolean;                  // creatingSession → spinner
  onClick: () => void;
  density: Density;
}
```
Renders: `loading ? <Spinner/> : kind==='stop' ? <Stop/> : kind==='countdown' ? <span>{seconds}</span> : <ArrowUpward/>`. One button, no duplication.

## PromptComposer orchestration (keeps the integration contract)

Reads the same contexts as today — chat (`creatingSession`, `handleSendMessage`,
`stopSessionResponse`), session (`currentSessionId`, `sessions`, `enteredInChatMode`), input
(`input`, `setInput`), ui (`setTextAreaRef`) — and the same auto-prompt props passed down from
`WebSdkContent`/`WebSdkInput` (`suggestedPrompt`, `countdown`, `autoPromptMode`, `mode`,
`onTakeoverSend`, `onSuggestedPromptSend`, `onExpandToFull`, `onInputStart`, `onFocusEmpty`,
`onBlur`, `isLoading`, `uiDensity`). **No change to those callbacks → cycle + events untouched.**

```ts
const status = deriveComposerStatus({
  thinking: currentSession?.thinking ?? false,
  autoPromptMode, isCompactMode: mode === 'compact',
  suggestedPrompt, countdown, input, hasUserMessages,
});
```
Precedence reproduces today's behavior: `generating` (thinking) → `countdown` → `suggested` →
`editable`. (Mirrors the current `isFullAutoPromptCounting`/`isCountdownOnlyCounting`/
`shouldShowCompactPrompt` chain — but now as named statuses.)

Wiring per status:
- **editable** → `<ComposerInput value={input} onChange onSubmit={handleSubmit} …/>` + action
  `send` (disabled when `!input`). Submit → expand-to-full + `handleSendMessage` (keyboard
  dismiss preserved).
- **generating** → `<ComposerInput/>` (typeable) + action `stop` → `stopSessionResponse`.
- **suggested** → `<PromptPreview label="Suggested" prompt/>` + action `send` →
  `onSuggestedPromptSend` (+ `onExpandToFull`).
- **countdown** → `<PromptPreview prompt/>` + action `countdown(seconds=countdown)` →
  `onTakeoverSend ?? onSuggestedPromptSend`. Focusing/tapping = takeover (single intent, no
  cancel race) — same as today.

## Density & styles

Use the single `DENSITY` config + named static class consts (per REFACTOR_PLAN.md). Atoms take
`density: Density` and read `DENSITY[density].{avatar,inputText,button,inputMinHeight,…}`. Line
height for the 8-line cap comes from the density slot. No inline `uiDensity === 'xs'` ternaries —
one `isTinyDensity` boolean where a structural (non-size) branch is unavoidable.

## New behavior (vs current)

- Editable input **auto-grows 1→8 lines then inner-scrolls** (was single-line nowrap).
- Formalised status set; `generating` is now first-class (stop button) instead of derived inside
  the editable branch.

Everything else maps onto existing handlers/props — no functional change to send/stop/auto-prompt.

## Build phases (typecheck after each)

1. `composer-status.ts` (+ `composer-status.test.ts`) — pure union + derive, unit-tested.
2. `ComposerActionButton.tsx`, `PromptPreview.tsx` (leaf atoms).
3. `ComposerInput.tsx` (editable + auto-grow).
4. `PromptComposer.tsx` (orchestrator wiring the atoms to contexts + auto-prompt props).
5. Point `WebSdkInput` at `./composer/PromptComposer`; delete `CustomInput.tsx`.
6. `grep -rn "CustomInput" src` → zero.

## Verification

- `pnpm -F @genuin/genai-sdk typecheck` / `lint` / `test` (incl. `composer-status.test.ts`).
- `pnpm -F @genuin/genai-sdk dev:app` → exercise every frame: Default/Focused/Typing/Typing-Max
  (type past 8 lines → inner scroll), Generating (stop cancels), Suggested (send), countdown
  (counter + takeover), each `uiDensity`, compact/full. Confirm the same outbound/inbound events
  + auto-prompt cycle behavior.

## Resolved decisions
- **PromptStatus chips** ("Prompting in…/Prompted/Paused. Resume") → sibling **above** the input,
  owned by `ScrollContent`/panel (`views/web-sdk/PromptStatus.tsx`), fed by cycle phase. Built as
  a separate small component alongside (not inside) the composer.
- **Avatar** → plain octo icon in every state.
- **Auto-commenting** → out of scope. Not a composer state; dropped from this design.
