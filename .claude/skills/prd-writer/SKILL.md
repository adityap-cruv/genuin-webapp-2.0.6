# Skill: PRD Writer

Use this skill when asked to write, update, or review a Product Requirements Document (PRD).

## What This Skill Covers

1. **Writing a PRD from scratch** — given a feature idea or brief, produce a complete PRD.
2. **Updating an existing PRD** — incorporate new decisions, constraints, or scope changes.
3. **Reviewing a PRD** — check for gaps, ambiguities, and missing acceptance criteria.

---

## PRD Structure

Every PRD must include these sections in order:

### 1. Overview

One paragraph. What is this feature, why does it exist, and who is it for?

### 2. Problem Statement

What problem are we solving? Include context on why this matters now.

### 3. Goals

Bullet list. What does success look like? Keep these measurable where possible.

### 4. Non-Goals

Explicit list of what is out of scope for this iteration. This prevents scope creep.

### 5. User Stories

Format:

```
As a [user type], I want to [action] so that [outcome].
```

Cover the primary flow and at least one edge case.

### 6. Functional Requirements

Numbered list. Each requirement should be specific and testable.
Example: `1. Users can upload files up to 10MB in PDF, PNG, or JPEG format.`

### 7. Non-Functional Requirements

Performance, security, accessibility, and scalability constraints.

### 8. Acceptance Criteria

For each functional requirement, define the condition that proves it is done.
Use Given/When/Then format where helpful.

### 9. Open Questions

Unresolved decisions that need input before or during implementation.

### 10. Out of Scope / Future Considerations

Ideas that came up but are deferred to a later iteration.

---

## Writing Guidelines

- Write in plain English. Avoid jargon unless the term has a precise meaning here.
- Be specific. "Fast" is not a requirement. "Responds in under 200ms at p95" is.
- Avoid implementation details in requirements — describe _what_, not _how_.
- Keep each requirement to one sentence. If it needs two, split it.
- Flag assumptions explicitly. If you assumed something to fill a gap, say so.

---

## Output Format

Return the PRD as a Markdown document.
Start with the title: `# PRD: [Feature Name]`
Include a metadata block at the top:

```
**Status**: Draft | In Review | Approved
**Author**: [name]
**Last updated**: [date]
**Stakeholders**: [list]
```