---
name: jira-ticket-writer
description: Create or edit a Jira ticket (GEN project on begenuin.atlassian.net) with correctly formatted description, title, assignee, and sprint. Use when asked to "create a ticket", "file a Jira", "make a ticket for this", or similar. Do NOT use for writing a PRD (use prd-writer) or for GitHub PRs.
---

# Skill: Jira Ticket Writer

Use this skill whenever creating or editing a Jira issue via the Atlassian MCP tools
(`createJiraIssue`, `editJiraIssue`).

## Cloud ID

`85a07bc0-f270-4782-a248-be54969c50c5` (begenuin.atlassian.net). Look it up again with
`getAccessibleAtlassianResources` only if this ever stops working.

## Formatting — use plain Markdown, never Jira wiki markup

This connector stores the description as literal ADF text — it does **not** auto-convert
old-style Jira wiki markup (`h2.`, `{{code}}`, `{code:json}...{code}`). Wiki markup renders as
broken literal text in the ticket. Confirmed broken on GEN-10238 (2026-08-12); fixed by
switching to Markdown.

**Always use standard Markdown:**

- `## Heading` for section headers (not `h2.`)
- `` `inline code` `` for inline code/paths (not `{{...}}`)
- ` ```json ... ``` ` fenced code blocks for JSON/code samples (not `{code:json}...{code}`)
- `**bold**`, `- bullet` / `* bullet` for lists

After creating or editing, if the user reports it still looks broken, re-check the rendered
ticket (ask them to paste what they see) before assuming the fix worked — this connector's
behavior isn't something you can screenshot-verify from here.

## Ticket structure

Keep it short — only what's needed to act on the ticket, not a transcript of the investigation:

```
## Summary
One or two sentences: what is being built/fixed and why, in user/business terms.

[Only if there's a concrete payload/schema/API shape worth pinning down — omit otherwise]
## Sources / Details
Short bullets, not paragraphs.

## Implementation
File(s) touched + one-line description each. Skip if not yet known (e.g. a bug report).

## Testing
What was verified and how. Note any known gaps explicitly rather than implying full coverage.

## Branch
`branch-name` — omit if not applicable (e.g. a bug report with no fix yet).
```

Drop any section that has nothing to say. Don't restate the full conversation history,
acceptance-criteria checklists, or context the assignee doesn't need to start work.

## Project, assignee, sprint

- **Project key**: `GEN` ("Engineering (Develop)"). Ask the user only if the request is for a
  different product (e.g. Marketing, Customer Success) — check `getVisibleJiraProjects` if unsure.
- **Issue type**: default `Task` unless it's clearly a `Bug` or `Story`.
- **Assignee**: this is per-person, not a fixed team default — never hardcode a name here.
  - First check your own personal memory (not this file) for a remembered default for _this_
    user. If found, use it and stop — don't ask again.
  - If no default is remembered yet, call `atlassianUserInfo` to get the currently authenticated
    Atlassian account (this correctly identifies whoever is running Claude right now, not a
    fixed person), then ask once via AskUserQuestion with that account as the default option
    ("You ({name})" vs "Ask every time" / "Someone else"). Once answered, save it to personal
    memory (e.g. a `feedback_jira_ticket_defaults` memory) and stop asking — reuse it on every
    future ticket until that user explicitly says to assign someone else or change the default.
  - Because this preference lives in personal memory (outside the repo), each teammate gets
    their own default the first time they use this skill — it does not carry over between
    people, and this file must never state a specific person's name as "the" default.
- **Sprint**: default to the **current active sprint** on the GEN board — do not ask each time.
  - Sprint is a custom field: `customfield_10020` (Jira Software "Sprint" field,
    `com.pyxis.greenhopper.jira:gh-sprint`).
  - To find the active sprint's ID, fetch any issue already in it and read
    `customfield_10020` (returns `[{id, name, state:"active", boardId, startDate, endDate}]`) —
    e.g. `getJiraIssue` with `fields: ["customfield_10020"]` on a recently-updated GEN issue
    (or query `project = GEN AND sprint in openSprints()` first to find one). Use that `id`.
  - Set it on creation via `editJiraIssue` fields `{"customfield_10020": <sprintId>}` right after
    `createJiraIssue` (the create call's own fields param doesn't need it — set it post-creation
    to keep the create call simple, or pass it inline via `additional_fields` if preferred).
  - A ticket with **no** sprint sits in the backlog and won't show on the active board view —
    this is what "wrong place / should be under GEN board" means in practice (seen on
    GEN-10238). Always set the sprint unless the user says "backlog" explicitly.

## Workflow

1. Resolve project (GEN unless told otherwise).
2. Resolve assignee (remembered default, or ask once — see above).
3. Resolve sprint (current active sprint on the GEN board, per above).
4. Write description using the Markdown structure above — short, only what's needed.
5. `createJiraIssue` with `projectKey`, `issueTypeName`, `summary`, `description`,
   `assignee_account_id`.
6. `editJiraIssue` to set `customfield_10020` to the active sprint ID.
7. Report back the issue key + URL. Don't dump the full field JSON to the user.
