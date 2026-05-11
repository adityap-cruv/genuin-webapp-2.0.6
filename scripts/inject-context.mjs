#!/usr/bin/env node

/**
 * Claude Code UserPromptSubmit hook.
 *
 * Fires on every prompt. Detects the user's intent, then silently injects
 * the matching agent + skill files into Claude's context window before it
 * responds — so routing rules and project conventions are always present.
 *
 * Input  (stdin):  JSON { prompt, session_id, cwd, ... }
 * Output (stdout): JSON { hookSpecificOutput: { hookEventName, additionalContext } }
 *                  Silent injection — not shown in the transcript.
 * Exit 0 always — this hook never blocks a prompt.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── Routing table ────────────────────────────────────────────────────────────
// Each rule maps intent keywords → agent file + optional skill file.
// Rules are tested in order; first match wins.

const ROUTES = [
  // Architect checked first — most specific structural intent
  {
    agent: { name: "architect", file: ".claude/agents/architect.md" },
    keywords: [
      "monorepo",
      "package placement",
      "adr",
      "system design",
      "scalability",
      "where should this live",
      "which package",
      "trade-off",
      "trade off",
      "folder structure",
      "file structure",
      "how to organize",
      "which approach",
      "best way to structure",
      "should i use",
      "where do i put",
      "architecture", // explicitly architectural — belongs here, not planner
    ],
  },
  // Planner: intent-specific phrases only — no generic question-starters
  // Generic starters ('what is', 'explain', 'tell me', etc.) were removed because
  // they caused planner to shadow debugger/implementer on nearly every prompt.
  {
    agent: { name: "planner", file: ".claude/agents/planner.md" },
    keywords: [
      "plan",
      "how should i",
      "what's the best approach",
      "what would you recommend",
      "how do i structure",
      "how does this work",
      "walk me through",
      "step by step",
      "understand the flow",
      "investigate flow",
      "deep dive",
    ],
  },
  {
    agent: { name: "implementer", file: ".claude/agents/implementer.md" },
    keywords: [
      "implement",
      "build ",
      "add ",
      "create ",
      "write ",
      "make a",
      "add feature",
      "write code for",
      "generate",
      "scaffold",
      "extend",
      "integrate",
      "migrate",
      "convert",
    ],
  },
  {
    agent: { name: "code-reviewer", file: ".claude/agents/code-reviewer.md" },
    keywords: [
      "review",
      "check this",
      "look at this",
      "is this correct",
      "is this good",
      "what do you think of this code",
      "give me feedback on",
      "code review",
      "take a look",
      "can you check",
      "any issues with",
      "does this look",
      "review my",
      "can i improve",
      "is there anything wrong",
      "feedback on this",
    ],
  },
  {
    agent: { name: "typescript-reviewer", file: ".claude/agents/typescript-reviewer.md" },
    keywords: [
      "typescript review",
      "type safety",
      "ts review",
      "review this pr",
      "review pr",
      "check types",
      // NOTE: 'type error' and 'undefined' intentionally excluded —
      // they match debug contexts (TypeError in stack traces, runtime undefined)
      // more often than TypeScript review requests.
      "typing issue",
      "type this",
      "proper types",
      "strict types",
    ],
  },
  {
    agent: { name: "debugger", file: ".claude/agents/debugger.md" },
    skill: { name: "debug", file: ".claude/skills/debug/SKILL.md" },
    keywords: [
      "debug",
      "fix",
      "broken",
      "error",
      "not working",
      "failing",
      "crash",
      "exception",
      "why is this",
      "what's wrong",
      "troubleshoot",
      "investigate",
      "stuck",
      "no output",
      "silent",
      "trace",
      "what's happening",
      "why is it stopping",
      "verify",
      "can't figure out",
      "doesn't work",
      "isn't working",
      "not rendering",
      "not showing",
      "not loading",
      "undefined",
      "null pointer",
      "issue with",
      "problem with",
      "something wrong",
      "wrong output",
      "unexpected behavior",
      "not found",
      "failed to",
      "why isn't",
      "why is it not",
      "still not",
      // NOTE: 'missing' intentionally excluded — too broad (matches "missing tests",
      // "missing from the PRD", etc.). Covered by 'not found' / 'undefined'.
    ],
  },
  {
    agent: { name: "security-auditor", file: ".claude/agents/security-auditor.md" },
    skill: { name: "security-audit", file: ".claude/skills/security-audit/SKILL.md" },
    keywords: [
      "security",
      "audit",
      "vulnerability",
      "is this safe",
      "secure",
      "exploit",
      "pentest",
      "injection",
      "auth issue",
      "permissions",
      "xss",
      "csrf",
      "sanitize",
      "exposed secret",
      "token leak",
      "can someone attack",
      "malicious input",
    ],
  },
  {
    agent: { name: "e2e-tester", file: ".claude/agents/e2e-tester.md" },
    skill: { name: "e2e-testing", file: ".claude/skills/e2e-testing/SKILL.md" },
    keywords: [
      "e2e",
      "end-to-end",
      "playwright",
      "user flow",
      "integration test",
      "write a test for",
      "test the flow",
      "test scenario",
      "test this feature",
    ],
  },
  {
    agent: { name: "prd-writer", file: ".claude/agents/prd-writer.md" },
    skill: { name: "prd-writer", file: ".claude/skills/prd-writer/SKILL.md" },
    keywords: [
      "prd",
      "product requirements",
      "write a spec",
      "feature spec",
      "requirements doc",
      "document the feature",
      "write requirements",
      "user story",
      "acceptance criteria",
    ],
  },
];

// Skill-only routes (no dedicated agent, but a skill applies)
const SKILL_ONLY_ROUTES = [
  {
    skill: { name: "performance", file: ".claude/skills/performance/SKILL.md" },
    keywords: [
      "performance",
      "slow",
      "optimize",
      "bundle size",
      "memory leak",
      "render",
      "lighthouse",
      "too slow",
      "takes too long",
      "lcp",
      "cls",
      "fcp",
      "web vitals",
      "lazy load",
    ],
  },
  {
    skill: { name: "accessibility", file: ".claude/skills/accessibility/SKILL.md" },
    keywords: [
      "accessibility",
      "wcag",
      "a11y",
      "aria",
      "screen reader",
      "keyboard nav",
      "tab order",
      "focus trap",
      "alt text",
      "color contrast",
    ],
  },
  {
    skill: { name: "refactor", file: ".claude/skills/refactor/SKILL.md" },
    keywords: [
      "refactor",
      "restructure",
      "clean up",
      "reorganize",
      "simplify",
      "too complex",
      "hard to read",
      "messy",
      "improve readability",
      "extract",
    ],
  },
  {
    skill: { name: "test-runner", file: ".claude/skills/test-runner/SKILL.md" },
    keywords: [
      "vitest",
      "unit test",
      "jest",
      "write tests",
      "test coverage",
      "test this function",
      "add tests",
      "missing tests",
      "test suite",
    ],
  },
  {
    skill: { name: "frontend-patterns", file: ".claude/skills/frontend-patterns/SKILL.md" },
    keywords: [
      "component",
      "hook",
      "react",
      "context",
      "state",
      "tanstack",
      "server component",
      "client component",
      "server action",
      "form",
      "modal",
      "ui",
      "tailwind",
      "custom hook",
      "use effect",
      "use state",
      "compound component",
      "render prop",
      "next.js",
      "app router",
      "page component",
      "layout",
      "suspense",
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchRoute(prompt, routes) {
  const lower = prompt.toLowerCase();
  return routes.find((r) => r.keywords.some((kw) => lower.includes(kw))) ?? null;
}

function readFileSafe(relPath) {
  try {
    return readFileSync(join(root, relPath), "utf-8");
  } catch {
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);

  let prompt = "";
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    prompt = input.prompt ?? "";
  } catch {
    process.exit(0);
  }

  if (!prompt.trim()) process.exit(0);

  const route = matchRoute(prompt, ROUTES);
  const skillOnlyRoute = !route ? matchRoute(prompt, SKILL_ONLY_ROUTES) : null;

  // Always inject routing reminder — even when no keywords match.
  // This ensures I never respond as a general assistant without checking routing rules first.
  const ROUTING_REMINDER = `\
## MANDATORY: Check routing rules before responding

Before writing any response, you MUST check whether this prompt matches a routing rule in CLAUDE.md.

**Routing rules are not optional.** If the user's intent matches any of these, activate the correct agent:
- Investigation / "how does X work" / "why is" / "what's happening" → \`planner\` (read-only)
- Fix / broken / error / not working → \`debugger\`
- Plan / design / structure / approach → \`planner\`
- Implement / build / add / create → \`implementer\`
- Code review / check this / feedback → \`code-reviewer\`
- TypeScript review / type safety / PR review → \`typescript-reviewer\`
- Architecture / monorepo / package placement → \`architect\`
- Security / vulnerability / audit → \`security-auditor\`
- E2E / Playwright / integration test → \`e2e-tester\`
- PRD / spec / requirements → \`prd-writer\`

**Default fallback**: If uncertain, activate \`planner\` in read-only mode before doing anything else.
Agents are in \`.claude/agents/\`. Do NOT skip this check.`;

  const sections = [ROUTING_REMINDER, "\n---\n"];

  if (route?.agent) {
    const content = readFileSafe(route.agent.file);
    if (content) {
      sections.push(`### Agent: ${route.agent.name}\n`);
      sections.push(content);
    }
  }

  const skillFile = route?.skill ?? skillOnlyRoute?.skill ?? null;
  if (skillFile) {
    const content = readFileSafe(skillFile.file);
    if (content) {
      sections.push(`\n### Skill: ${skillFile.name}\n`);
      sections.push(content);
    }
  }

  // Always inject guardrails — they apply to every prompt
  const guardrails = readFileSafe(".claude/guardrails.json");
  if (guardrails) {
    sections.push("\n### Guardrails (apply to every response)\n");
    sections.push("```json\n" + guardrails + "\n```");
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: sections.join("\n"),
      },
    })
  );

  process.exit(0);
}

main().catch(() => process.exit(0));
