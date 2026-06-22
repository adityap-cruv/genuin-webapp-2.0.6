---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree one at a time. Use when the user wants to stress-test a plan, "get grilled" on a design, says "grill me" / "interrogate me" / "pressure-test this", or kicks off a feature that is underspecified. Do NOT use once requirements are clear, for the formal spec (use prd-writer), or for exploring the solution space (use superpowers brainstorming).
---

# Grill Me

**When to use:** The user wants to stress-test a plan, "get grilled" on a design, says "grill me" / "interrogate me" / "pressure-test this", or kicks off a feature that is underspecified. Interview the user relentlessly about every aspect of the plan or design until you reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. The goal is to expose unknowns now, before any code — not to design the solution.

**Do NOT use for:** Requirements that are already clear; the formal spec (use prd-writer); or exploring the solution space (use superpowers brainstorming).

## Method

- **Ask one question at a time.** Wait for the answer, then ask the next. Never dump a list.
- **For each question, give your recommended answer** (with a one-line why), so the user can confirm or correct instead of starting from a blank page.
- **Walk the decision tree in dependency order** — resolve the decision that unblocks the most others first; later questions often depend on earlier answers.
- **If a question can be answered by exploring the codebase, explore the codebase instead of asking.** Don't make the user tell you what the code already says.
- **Stop** the moment the plan has no remaining ambiguity — don't grill for its own sake.

## Where to dig (this repo)

- **Scope & placement** — webapp-only, or shared in `packages/components` (affects the web-sdk too)? atom / molecule / organism?
- **Data** — source, shape, and the loading / empty / error states.
- **Boundaries** — auth-gated? per-user? Server Component or client? crosses the RSC boundary?
- **Edge cases** — null/empty, long content, slow network, concurrent edits, mobile/touch.
- **Done means** — how we'll know it works, and what is explicitly out of scope.

## Output

When the branches are resolved, restate:

> **Shared understanding:** [crisp 2–4 line summary of the agreed plan]
> **Still open:** [anything deferred, or "nothing"]

Then hand off — `planner` agent for a plan, `prd-writer` for a formal spec, or implement if small.

> Complements `superpowers:brainstorming` (explores the *solution space*); grill-me nails down the *decisions and requirements*. Sibling idea: `grill-with-docs` (mattpocock) also updates ADRs — consider it later if the team adopts an ADR/CONTEXT doc workflow.
