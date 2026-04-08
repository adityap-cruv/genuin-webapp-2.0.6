# PRD: AI Agent Configuration System

**Status:** Draft  
**Author:** GitHub Copilot (PRD Writer Mode)  
**Last updated:** 27 March 2026  
**Stakeholders:** Engineering team, DevOps, Product management, Team leads

---

## 1. Overview

The AI Agent Configuration System is a centralized configuration management platform that maintains a single source of truth (`.team/`) for all AI tool settings, then automatically syncs them to both GitHub Copilot (`.github/`) and Claude Code (`.claude/`) environments. The system enables engineering teams to define seven specialized AI agents with consistent capabilities, tool permissions, skills, and guardrails across both AI platforms, eliminating configuration duplication and ensuring deterministic, expert-level AI assistance throughout the development lifecycle.

---

## 2. Problem Statement

Engineering teams using AI code assistants face three interconnected challenges:

1. **Configuration Fragmentation**: AI tool configurations live in separate, platform-specific locations (GitHub Copilot and Claude Code), requiring manual synchronization when standards or agent capabilities change. Teams end up maintaining duplicate, inconsistent rule sets across multiple tools.

2. **Inconsistent AI Behavior**: Without specialized routing and tool restrictions, AI assistants provide generic advice rather than expert guidance tailored to specific tasks (planning vs. implementation vs. security auditing). This results in lower-quality output and longer feedback cycles.

3. **Compliance and Standards Enforcement**: Engineering standards (security constraints, guardrails, naming conventions) are difficult to enforce across AI-generated code. Teams have no centralized mechanism to define "never do this" rules or require approval for sensitive changes before AI tools execute them.

These problems create friction in AI-assisted workflows and undermine code quality, especially in regulated environments or when scaling to multiple teams across a monorepo.

---

## 3. Goals

- **Eliminate configuration duplication**: Teams define rules, agents, and skills once in `.team/` and automatically propagate them to GitHub Copilot and Claude Code with zero manual effort.
- **Route users to specialist agents**: Users receive expert-level guidance appropriate to their task type (planning, implementation, review, debugging, security, testing, requirements documentation) by default, not generic advice.
- **Enforce engineering standards**: All seven AI agents respect a centralized guardrails system that prevents unsafe patterns (hardcoded secrets, unsafe SQL, `console.log` in production code, etc.) and blocks changes that require human approval.
- **Reduce setup friction**: New team members can onboard with AI assistance configured correctly in under 5 minutes by running `pnpm ai:sync`.
- **Enable rapid iteration on standards**: When team conventions change (e.g., new security requirement), update `.team/instructions.md` once and all AI agents reflect the change within 300ms via the file watcher.
- **Support monorepo-scale complexity**: The system scales from single-app projects to large monorepos with 7+ apps, shared packages, and multiple teams by providing org-wide base rules with optional per-agent overrides.

---

## 4. Non-Goals

- **Support other AI tools** (Claude Desktop, ChatGPT, custom LLMs) — this is GitHub Copilot and Claude Code only in this release.
- **Replace human code review** — the reviewer agent augments human review by catching obvious issues; final decisions require human judgment.
- **Provide IDE-level real-time linting** — the system generates static configuration files read at AI session start; it does not hook into VS Code's problem diagnostics or real-time error squigglies.
- **Support per-workspace configuration** — `.team/` applies org-wide; sub-teams cannot yet override specific agents or guardrails locally.
- **Fine-tuning or custom model training** — the system works with out-of-the-box GitHub Copilot and Claude Code models.

---

## 5. User Stories

```
As a developer, I want GitHub Copilot to suggest implementations using the "implementer" agent
so that I get code that follows project conventions without needing to specify styles and patterns.

As a team lead, I want to add a new security guardrail (e.g., "never use eval()") 
so that all AI agents across the team immediately enforce it on every prompt.

As an engineer, I want the debugger agent to help me find root causes in failing tests
so that I can fix issues faster with AI guidance tailored to debugging, not general chat.

As a DevOps engineer, I want the configuration to sync automatically when I push to main
so that production deployments never run with stale or out-of-sync AI configuration.

As a new team member, I want to run `pnpm ai:sync` when I update `.team/` configurations
so that my local AI tools are immediately updated with the latest settings.

As a security auditor, I want the security-auditor agent to review code for injection vulnerabilities
so that I can catch security issues early rather than in post-commit scanning.

As a product manager, I want the prd-writer agent to generate structured PRDs from my notes
so that I can document requirements faster and ensure they are implementation-ready.

As a developer pushing to production, I want to be blocked if I try to add hardcoded secrets
so that I cannot accidentally leak credentials via AI-generated code.
```

---

## 6. Functional Requirements

1. The system reads all configuration files from the `.team/` directory (agents, skills, instructions, guardrails, prompts) on every sync invocation.

2. The `sync-ai-config.mjs` script generates correctly formatted configuration into `.github/` (GitHub Copilot format with YAML frontmatter) and `.claude/` (Claude Code format) with no manual intervention.

3. The sync script combines base `.team/instructions.md` with tool-specific deltas (`.team/copilot/instructions.md`, `.team/claude/instructions.md`) and writes the merged output to `.github/copilot-instructions.md` and `.claude/CLAUDE.md`.

4. Each of the seven agents (planner, implementer, reviewer, debugger, security-auditor, e2e-tester, prd-writer) is defined as a separate `.md` file in `.team/agents/` and synced to both `.github/agents/` and `.claude/agents/`.

5. The `agents.config.json` file defines tool restrictions (list of permitted VS Code Copilot tools) for each agent; the sync script injects these restrictions into generated agent files as YAML frontmatter for GitHub Copilot compatibility.

6. Skills are loaded from `.team/skills/` (flat `.md` files or `SKILL.md` inside folders); the `skills.registry.json` tracks local and remote skills; the sync script does not modify skill content but ensures the registry is copied to generated directories.

7. The `guardrails.json` file defines never/always/requireApproval rules; the sync script includes guardrails in the base instructions so all AI agents have access to the same safety constraints.

8. The sync script skips writing output files if content is identical to the existing file, preventing unnecessary updates.

---

## 7. Non-Functional Requirements

- **Sync latency**: The file watcher must invoke the sync script and complete within 500ms on a standard development machine (8-core CPU, SSD) for typical monorepo sizes (5–10 apps, 20–30 packages).
- **No external dependencies on tools**: The system must not require GitHub Copilot or Claude Code to be running or connected during sync; it generates static configuration files that are read at tool startup.
- **Fail-safe**: If the sync script encounters an error (invalid JSON, missing file), it must exit with a non-zero status, log a clear error message, and not partially write files.
- **Backward compatibility**: The system must read `.team/` configurations in version N and write to `.github/` and `.claude/` formats compatible with GitHub Copilot 1.200+ and Claude Code 1.0+.
- **Dry-run mode**: The sync script must support a `--dry-run` flag that previews changes without writing files; useful in CI to verify configuration is up to date.
- **File size limits**: The sync script must handle `.team/` configurations up to 50 MB without performance degradation (typical: <5 MB).
- **Cross-platform**: The sync script must work identically on macOS, Linux, and Windows; all file paths must use `/` separators in generated output.

---

## 8. Acceptance Criteria

### Requirement 1: Read configuration from `.team/`
```
Given a `.team/` directory with agents/, skills/, instructions.md, and guardrails.json
When the sync script runs
Then all files are read without errors and no file is read more than once
```

### Requirement 2: Generate correctly formatted output
```
Given a `.team/agents/implementer.md` file
When the sync script runs
Then the script writes `.github/agents/implementer.agent.md` with YAML frontmatter 
  listing tools from agents.config.json
And the script writes `.claude/agents/implementer.md` with no frontmatter
```

### Requirement 3: Combine base + delta instructions
```
Given `.team/instructions.md` (500 lines) and `.team/copilot/instructions.md` (delta, 50 lines)
When the sync script runs
Then the script writes `.github/copilot-instructions.md` with base + copilot delta combined
And the script writes `.claude/CLAUDE.md` with base + claude delta combined
```

### Requirement 4: All agents synced
```
Given 7 agent files in `.team/agents/` (planner, implementer, reviewer, debugger, security-auditor, e2e-tester, prd-writer)
When the sync script runs
Then all 7 agents are written to `.github/agents/` and `.claude/agents/`
And no agents are missing or duplicated
```

### Requirement 5: Tool restrictions injected
```
Given agents.config.json with "planner": { "tools": ["codebase", "search", "usages"] }
When the sync script runs
Then `.github/agents/planner.agent.md` contains YAML frontmatter with tools: [codebase, search, usages]
And Claude agents do not contain tool restrictions (Claude reads from codebase context)
```

### Requirement 6: Skills copied and tracked
```
Given `.team/skills/refactor.md` and `.team/skills/debug/SKILL.md`
When the sync script runs
Then both skills are copied to `.github/skills/` and `.claude/skills/`
And the sync script does not modify skill content
And skills.registry.json is copied unchanged
```

### Requirement 7: Guardrails included
```
Given `.team/hooks/guardrails.json` with 20+ rules
When the sync script runs
Then guardrails are embedded in the "never", "always", and "requireApproval" sections 
  of generated instructions
And all agents have access to the same guardrails
```

### Requirement 9: Skip unchanged files
```
Given an existing `.github/copilot-instructions.md` with content X
When the sync script runs and the new content is also X
Then the script does not write the file (stat mtime remains unchanged)
And `dryRunChanges` is not incremented
```

### Requirement 10: ChatModes generated
```
Given `.team/chatmodes/planning.chatmode.md`
When the sync script runs
Then `.github/chatmodes/planning.chatmode.md` is generated
And Copilot users can use `@planning` in chat
```

### Requirement 11: Pre-commit sync
```
Given a change to `.team/instructions.md`
When the developer commits with `git commit -m "..."`, the pre-commit hook runs sync
When CI begins, the `--dry-run` flag verifies generated files are up to date
Then the configuration stays synchronized
```

---

## 9. Open Questions

1. **Per-workspace configuration**: Should individual teams be able to override specific agents or guardrails locally (e.g., Team A requires security approval for all changes, Team B does not)? This would require a second-level hierarchy (`.team/workspaces/{team-name}/`) — is this needed now or deferred to a future release?

2. **Remote skill versioning**: The `skills.registry.json` can reference remote GitHub skills. Should the system pin specific commits/tags, or always fetch the latest? How should version conflicts be surfaced if two agents require incompatible versions of the same skill?

3. **Agent performance tracking**: Should the system log metrics on which agents are invoked, how long they take to respond, and success rates? This would help teams optimize agent routing and identify slow operations.

4. **Conditional guardrails**: Some guardrails may apply only to certain packages or environments (e.g., "no hardcoded secrets" is always enforced, but "require approval for external API calls" only in production). Should the guardrails system support conditions?

5. **Skill skill-load precedence**: If a skill file exists in both `.github/skills/` (fetched from GitHub) and `.team/skills/` (local override), which takes precedence? Should local always override, or should there be explicit conflict resolution?

---

## 10. Out of Scope / Future Considerations

- **Support for additional AI tools**: In a future release, expand beyond GitHub Copilot and Claude Code to include Claude Desktop, ChatGPT, LLaMA, or custom fine-tuned models. This would require a plugin architecture for tool-specific format generators.

- **Dynamic agent selection based on git context**: The system could analyze staged files (e.g., `*.test.ts` → suggest e2e-tester agent; `*.md` → suggest prd-writer agent) and recommend agents automatically, rather than requiring manual routing.

- **Agent performance analytics**: Build dashboards showing agent usage patterns, success rates, latency, and cost (if applicable). Teams could use this data to optimize agent configuration or detect when an agent is underperforming.

- **Guardrail severity levels and policy enforcement**: Upgrade guardrails to support severity levels (warning vs. error vs. fatal) and team-level policies (e.g., "enforces this guardrail for Team A but not Team B"). Could integrate with SAML/SSO for policy enforcement.

- **Skill marketplace and discovery**: Build a public registry where teams can browse, rate, and curate skills from the community. The current system only supports GitHub repos; a marketplace would enable discoverability and best-practice sharing.

- **LLM-driven configuration generation**: Use Claude or GPT-4 to generate initial `.team/` configurations by analyzing the codebase and asking the user clarifying questions. This would reduce manual setup time for new projects.

- **IDE extension for `.team/` editing**: Create a VS Code extension that provides syntax highlighting, linting, and real-time previews of `.team/` configuration changes without needing to run the sync script manually.

---

## Implementation Notes

This PRD documents the **current state** of the AI Agent Configuration System as of 27 March 2026. The system is already implemented and running in production across the genuin-webapp monorepo, with all seven agents actively used by the team.

The functional requirements above reflect the actual capabilities that have been built and tested. This PRD serves as the authoritative specification document and can be updated as new features or agents are added.