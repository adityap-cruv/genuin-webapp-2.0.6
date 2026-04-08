---
name: accessibility
description: Audit and fix accessibility issues targeting WCAG 2.1 Level AA — semantic HTML, keyboard navigation, focus management, forms, contrast, ARIA, and motion
---

# Skill: Accessibility

Use this skill when auditing, writing, or fixing code for accessibility. Target standard
is WCAG 2.1 Level AA.

---

## Audit checklist

### 1. Semantic HTML

- [ ] Interactive elements use native HTML: `<button>` for actions, `<a href>` for
      navigation — never `<div onClick>` or `<span onClick>`
- [ ] Headings (`h1`–`h6`) are used for document structure, not for visual styling
- [ ] One `<h1>` per page; heading levels do not skip (no `h1` → `h3`)
- [ ] Lists use `<ul>`, `<ol>`, `<dl>` — not a series of `<div>` or `<p>` elements
- [ ] Tables use `<th>` with `scope` for headers, `<caption>` for table title
- [ ] Landmark regions present: `<header>`, `<nav>`, `<main>`, `<footer>`

### 2. Keyboard navigation

- [ ] All interactive elements are reachable by `Tab` key
- [ ] `Tab` order follows the visual reading order
- [ ] No keyboard trap — user can always navigate away from any component
- [ ] Custom components (dropdowns, modals, tabs) implement full keyboard patterns:
  - Modal: `Esc` closes, focus trapped inside while open, returns to trigger on close
  - Dropdown: arrow keys navigate options, `Esc` closes, `Enter`/`Space` selects
  - Tabs: arrow keys move between tabs, `Enter` activates
- [ ] Focus is never lost after an action (button click, form submit, modal close)
- [ ] Skip-to-main-content link present as first focusable element on each page

### 3. Focus indicators

- [ ] All focusable elements have a visible focus ring — `:focus-visible` applied
- [ ] Focus ring is never suppressed with `outline: none` without a visible replacement
- [ ] Focus ring has at least 3:1 contrast ratio against adjacent colours

### 4. Forms

- [ ] Every input has an associated `<label>` via `htmlFor`/`id` or `aria-labelledby`
- [ ] Placeholder text is not used as a substitute for a label
- [ ] Required fields marked with `aria-required="true"` (and visually)
- [ ] Error messages are associated with their input via `aria-describedby`
- [ ] Error messages describe what went wrong and how to fix it — not just "Invalid"
- [ ] Form submission errors move focus to the error summary or first errored field

### 5. Images & media

- [ ] Informative images have descriptive `alt` text (describes content and purpose)
- [ ] Decorative images have `alt=""` so screen readers skip them
- [ ] Icon-only buttons have `aria-label` describing the action
- [ ] SVG icons used interactively have `role="img"` and `aria-label`
- [ ] Video has captions; audio has a transcript

### 6. Colour & contrast

Minimum contrast ratios (WCAG AA):

| Text type                        | Ratio |
| -------------------------------- | ----- |
| Normal text (< 18pt / 14pt bold) | 4.5:1 |
| Large text (≥ 18pt / 14pt bold)  | 3:1   |
| UI components & focus indicators | 3:1   |

- [ ] Information is never conveyed by colour alone (also use shape, text, or pattern)
- [ ] Links are distinguishable from body text by more than colour (underline or bold)

### 7. Dynamic content & ARIA

- [ ] Loading states announced to screen readers via `aria-live="polite"` or
      `aria-busy="true"`
- [ ] Error toasts / alerts use `role="alert"` or `aria-live="assertive"`
- [ ] Modals use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
- [ ] Expanded/collapsed states use `aria-expanded`
- [ ] Custom widgets implement the correct ARIA pattern from APG
      (https://www.w3.org/WAI/ARIA/apg/patterns/)
- [ ] ARIA is only used when native HTML cannot achieve the same result

### 8. Motion & animation

- [ ] All animations respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- [ ] No content flashes more than 3 times per second (seizure risk)

---

## Common React patterns

### Accessible icon button

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <CloseIcon aria-hidden="true" />
</button>
```

### Input with error

```tsx
<div>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-describedby={error ? "email-error" : undefined}
    aria-invalid={!!error}
  />
  {error && (
    <span id="email-error" role="alert">
      {error}
    </span>
  )}
</div>
```

### Focus trap for modal

```tsx
// Use a library like focus-trap-react rather than implementing manually
import FocusTrap from "focus-trap-react";

<FocusTrap active={isOpen}>
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Confirm deletion</h2>
    ...
  </div>
</FocusTrap>;
```

### Skip link

```tsx
// First element in <body>
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Visually hidden until focused:
// .skip-link { position: absolute; transform: translateY(-100%); }
// .skip-link:focus { transform: translateY(0); }
```

---

## Severity definitions

| Level         | Definition                                                               |
| ------------- | ------------------------------------------------------------------------ |
| 🔴 Must fix   | Blocks keyboard users or screen reader users entirely; WCAG A/AA failure |
| 🟡 Should fix | Significantly degrades experience; best practice violation               |
| 🟢 Consider   | Enhancement; goes beyond AA                                              |

---

## Testing tools

- **axe DevTools** (browser extension) — automated WCAG scanning
- **Keyboard-only testing** — unplug the mouse, navigate the entire flow with Tab / Enter / Esc
- **Screen reader testing** — VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android)
- **Playwright + axe-core** — automated checks in CI:
  ```ts
  import { checkA11y } from "axe-playwright";
  test("home page has no a11y violations", async ({ page }) => {
    await page.goto("/");
    await checkA11y(page);
  });
  ```