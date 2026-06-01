---
name: refactor
description: Restructure, rename, or clean up existing code without changing observable behaviour. Use when refactoring, simplifying, deduplicating, or reorganising code. Do NOT use for fixing bugs (use the debug skill) or adding features (use the implementer agent).
---

# Skill: Refactor

Use this skill when restructuring, renaming, or cleaning up existing code without
changing its observable behaviour.

---

## The golden rule

**A refactor must not change what the code does — only how it is written.**

If you are fixing a bug while refactoring, that is two separate changes. Split them.
If you are adding a feature while refactoring, stop — refactor first, feature second.
Mixed-purpose PRs make review harder and introduce risk.

---

## Before touching any code

### 1. Confirm test coverage exists

You need a safety net before moving things around.

```bash
pnpm test --coverage
```

If the area you are refactoring has low coverage, **write the tests first**.
A refactor without tests is not a refactor — it is a rewrite with unknown consequences.

### 2. Understand what the code does

Read the code before changing it. This sounds obvious but is frequently skipped.

- What are the inputs and outputs?
- What side effects does it have?
- Who calls this? Use `usages` to find all call sites.
- What are the edge cases the current code handles (even if poorly)?

### 3. Define the scope

Decide exactly what you are changing before writing a line.
Scope creep during refactoring is how bugs get introduced.

---

## Refactor types and how to execute them safely

### Rename (variable, function, type, file)

1. Use your editor's "Rename symbol" — not find-and-replace across files
2. Verify all imports updated, especially dynamic `import('...')` paths
3. If renaming a public API surface — **this requires team approval first**
4. If renaming a file, check for string references (e.g. in tests, config files, docs)

### Extract function / component

1. Identify the block to extract — it should have a single clear responsibility
2. Determine what it needs as input (parameters) and what it returns
3. Write the extracted function in its new location
4. Replace the original block with a call to the new function
5. Run the tests — behaviour should be identical
6. Name the extracted function after what it does, not how it does it:
   - Bad: `processDataAndUpdateStateAndLog()`
   - Good: `applyDiscountToOrder()`

### Flatten nested logic

Deep nesting (3+ levels of `if`/`for`) is hard to read and test. Flatten with early returns:

```ts
// Before — pyramid of doom
function processOrder(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.user.isVerified) {
        return chargeCard(order);
      }
    }
  }
}

// After — early returns
function processOrder(order: Order) {
  if (!order) return;
  if (order.items.length === 0) return;
  if (!order.user.isVerified) return;
  return chargeCard(order);
}
```

### Split large files

A file is too large when it is hard to answer "what is this file responsible for?"
A good file has one reason to change.

1. Identify the distinct responsibilities in the large file
2. Create a new file for each responsibility
3. Move the code (use editor refactoring tools, not copy-paste)
4. Update imports one file at a time
5. Run tests after each move — do not batch all the moves then test

### Remove dead code

- Use `usages` / IDE references to confirm a function or export is truly unreachable
- Check for string-based lookups (e.g. `obj[key]`) where the key comes from data — the
  function might be called dynamically
- Remove the code, run the test suite, check CI — do not comment it out

---

## Naming conventions (project standard)

| Thing                 | Convention               | Example               |
| --------------------- | ------------------------ | --------------------- |
| Variables & functions | camelCase                | `getUserById`         |
| React components      | PascalCase               | `UserProfileCard`     |
| Types & interfaces    | PascalCase               | `OrderLineItem`       |
| Constants             | SCREAMING_SNAKE          | `MAX_FILE_SIZE_MB`    |
| Files (non-component) | kebab-case               | `format-date.ts`      |
| Files (component)     | PascalCase               | `UserProfileCard.tsx` |
| Test files            | same as source + `.test` | `format-date.test.ts` |
| E2E test files        | PascalCase + `.page`     | `Checkout.page.ts`    |

---

## Output format

For a refactor PR or response, present:

1. **What changed** — a plain-English description of the structural change
2. **What did not change** — confirm the public interface and behaviour are identical
3. **Test results** — confirm the existing tests still pass
4. **Any follow-up recommended** — things noticed but intentionally left for a separate change

---

## What you must never do

- Fix bugs while refactoring — open a separate issue/PR
- Add features while refactoring — same rule
- Rename public API surfaces without team approval
- Delete code without confirming it is unreachable
- Skip running the test suite after each meaningful structural change
- Leave the codebase in a broken state mid-refactor — each commit should be green