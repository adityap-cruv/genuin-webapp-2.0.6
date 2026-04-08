# Copilot-Specific Instructions

This document **extends** the base project instructions in `../instructions.md`.  
All base rules (1-7) apply to Copilot. The sections below add Copilot-specific routing and behavior.

---

## Table of Contents

1. [Additional Agent Routing](#additional-agent-routing)
2. [Chat Mode Usage](#chat-mode-usage)

---

## Agent Routing (Keyword-Based)

The base `instructions.md` defines the routing table. Apply the first matching rule below.

**1. Planning** — prompt contains: `plan`, `how should I`, `what's the best approach`, `design`, `architecture`, `what would you recommend`, `where should I put`, `how do I structure`
→ Activate `planner`. Do not write code. Explore codebase first.

**2. Implementation** — prompt contains: `implement`, `build`, `add`, `create`, `write`, `make`, `add feature`, `write code for`
→ Activate `implementer`. Types first, then implementation, then tests.

**3. Review** — prompt contains: `review`, `check this`, `look at this`, `is this correct`, `is this good`, `what do you think of this code`, `give me feedback on`
→ Activate `code-reviewer`.

**4. Debug** — prompt contains: `debug`, `fix`, `broken`, `error`, `not working`, `failing`, `crash`, `exception`, `why is this`, `what's wrong`, `troubleshoot`, `investigate`, `stuck`, `no output`, `silent`, `trace`, `what's happening`, `why is it stopping`, `verify`, `can't figure out`, `there is a bug`, `bug`
→ Activate `debugger`. Reproduce → localise → hypothesise → verify → minimal fix.

**5. Security** — prompt contains: `security`, `audit`, `vulnerability`, `is this safe`, `secure`, `exploit`, `pentest`, `injection`, `auth issue`, `permissions`
→ Activate `security-auditor`. Read-only — does not modify files.

**6. E2E / testing** — prompt contains: `e2e`, `end-to-end`, `playwright`, `user flow`, `integration test`, `write a test for`
→ Activate `e2e-tester`.

**7. PRD / product** — prompt contains: `prd`, `product requirements`, `write a spec`, `feature spec`, `requirements doc`
→ Activate `prd-writer`.

**8. Investigation** — prompt contains: `how does this work`, `trace the issue`, `walk me through`, `step by step`, `understand the flow`, `where is it failing`, `investigate flow`, `deep dive`, `there is an issue`
→ Activate `planner` in read-only mode. Map the flow without making changes.

---

## Additional Routing (Copilot-specific)

**9. Performance requests** — if the prompt contains any of:
`performance`, `slow`, `optimise`, `optimize`, `re-render`, `bundle size`, `n+1`,
`query is slow`, `lag`, `profiling`
→ Check for: unnecessary re-renders, unstable props, missing memoisation, N+1 queries,
missing indexes, large bundle imports. Measure before and after any change.

**10. Accessibility requests** — if the prompt contains any of:
`accessibility`, `a11y`, `wcag`, `screen reader`, `keyboard nav`, `aria`, `contrast`
→ Target WCAG 2.1 Level AA. Check: semantic HTML, keyboard operability, label associations,
ARIA correctness, colour contrast, focus visibility.

**11. Refactor requests** — if the prompt contains any of:
`refactor`, `clean up`, `restructure`, `rename`, `extract`, `simplify this`
→ Confirm tests exist before making any changes. No behaviour changes — refactor only.
Test before and after. One concern per change.

---

## Chat Mode Usage

Use `/planning` chat mode when discussing approach before implementation — it is read-only
and will not edit files.

Use `/review` chat mode for a thorough structured code review — also read-only.
