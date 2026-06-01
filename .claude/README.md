# Skills & Agents Catalog

This repo ships **16 skills** and **9 specialist agents** for Claude Code. This page is the team
reference: what each one does and **what to say to trigger it**.

## How activation works (no slash commands needed)

You do **not** type `/skill-name`. Claude reads your prompt, matches it against each skill's
`description`, and loads the relevant one automatically. Just describe the task in plain English —
the "say something like" column below shows phrasings that reliably trigger each skill. If Claude
picks the wrong one, name it directly ("use the nextjs-cache skill").

- **Skills** = injected knowledge ("how we do X here"). Cheap. Loaded on demand.
- **Agents** = separate workers with their own context, dispatched for a task and chained together.
- **Token economy:** small tasks are handled inline (no skill/agent needed). Skills load only when
  the task matches; agents are spawned only when the work is big enough to be worth it.
- **Codebase memory:** `.claude/codebase-map.md` is a living, team-shared file Claude reads before
  searching and appends to after learning something non-obvious (via the `codebase-memory` skill).
  It's how the team stops re-discovering the same files/flows every session — grow it over time.

---

## Skills (16)

### Understanding the codebase
| Skill | Use it for | Say something like |
|-------|-----------|--------------------|
| **zoom-out** | High-level map of an unfamiliar area before diving in | "how does X fit together", "give me the big picture", "zoom out", "where does this live" |
| **codebase-memory** | Reusing/recording what we've learned about the codebase (reads & writes `.claude/codebase-map.md`) | auto: fires before broad searches and after learning something non-obvious |

### Building & frontend
| Skill | Use it for | Say something like |
|-------|-----------|--------------------|
| **frontend-patterns** | Building React/Next UI the repo way (RSC, hooks, forms, Tailwind v4, atomic design) | "build a component", "add this page/hook", "how do we do forms here" |
| **composition-patterns** | Designing a component's API — compound components, variants over boolean props, provider DI | "too many boolean props", "design this component's API", "make this reusable" |
| **nextjs-server-performance** | Server Component waterfalls, parallel fetching, RSC-boundary footguns | "this server page is slow", "parallelize these fetches", "RSC waterfall" |
| **nextjs-cache** | Next 15 caching / ISR / revalidation behaviour | "data is stale", "why is this route dynamic", "set up revalidation" |

### Reviewing & quality
| Skill | Use it for | Say something like |
|-------|-----------|--------------------|
| **performance** | Client render perf, bundle size, memoization (React Compiler-aware) | "this is janky", "bundle too big", "why does this re-render" |
| **accessibility** | WCAG 2.1 AA audit — keyboard, focus, contrast, ARIA | "check accessibility", "is this keyboard-usable", "a11y review" |
| **web-design-review** | Design/UX/motion/typography/i18n review (non-a11y) | "review my UI", "check the design", "polish this screen" |
| **security-audit** | Read-only vuln review — injection, XSS, auth, secrets | "is this safe", "security review", "audit this auth change" |
| **refactor** | Behaviour-preserving cleanup | "refactor this", "clean this up", "simplify", "deduplicate" |

### Testing & debugging
| Skill | Use it for | Say something like |
|-------|-----------|--------------------|
| **debug** | Fixing bugs (repo-specific gotchas) | "this is broken", "getting this error", "not working", "failing" |
| **test-runner** | Unit/integration tests (Vitest, Jest in packages/ui) | "write a unit test", "fix this Vitest test", "test this function" |
| **e2e-testing** | Playwright E2E / user flows | "write an e2e test", "Playwright", "test this user flow" |

### Planning & process
| Skill | Use it for | Say something like |
|-------|-----------|--------------------|
| **grill-me** | Interrogated to lock down requirements before building | "grill me", "interrogate me", "pressure-test this plan" |
| **prd-writer** | Writing a PRD / feature spec | "write a PRD", "spec this feature", "requirements doc" |

---

## Agents (9)

Agents are dispatched by Claude's Agent tool based on their description; they do work in their own
context and chain together (see Orchestration below).

| Agent | Role |
|-------|------|
| **planner** | Read-only. Explores the codebase, produces a file-by-file implementation plan. |
| **implementer** | Writes production code (types → implementation → tests) following repo conventions. |
| **code-reviewer** | Reviews a diff for quality/security; git-history-aware (catches regressions). |
| **typescript-reviewer** | TypeScript-focused review — type safety, async correctness. |
| **architect** | Package placement, monorepo/system design, ADRs. |
| **debugger** | Root-causes a stubborn bug and applies a minimal fix. |
| **security-auditor** | Read-only security audit (auth, injection, secrets, CORS/CSP). |
| **e2e-tester** | Writes Playwright tests using the Page Object Model. |
| **prd-writer** | Produces a PRD with Given/When/Then acceptance criteria. |

---

## Orchestration — agents chaining (the "one after another" flow)

For a substantial, multi-step task, the agents run in sequence and hand off:

```
grill-me ─▶ planner ─▶ implementer ─▶ code-reviewer ─▶ (e2e-tester)
(if vague)  (plan)     (build)        (review diff)     (if user flow)
```

- Use **grill-me** first only if the request is vague; **`superpowers:brainstorming`** instead when
  the *solution* (not the requirements) is open-ended.
- **A one-line fix skips all of this** — Claude just does it inline. The chain is for work big enough
  that the hand-offs save rework.

The orchestration rules live in [.claude/CLAUDE.md](../CLAUDE.md) ("Orchestration" section).

---

## Adding or editing a skill

Skills are authored directly here (no build/sync step). Each lives at `skills/<name>/SKILL.md` with
YAML frontmatter (`name` + `description`) and a Markdown body. Conventions:

- **Description is the trigger** — write it trigger-first, state *what* + *when*, add "Do NOT use
  for…" exclusions to disambiguate overlapping skills.
- **Keep `SKILL.md` under ~500 lines.** Push detail into a `references/` subfolder loaded on demand
  (see `frontend-patterns/` for the pattern).
- See `superpowers:writing-skills` for the authoring workflow.
