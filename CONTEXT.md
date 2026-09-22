# Ticket Traceability

How this repo ties every code change back to the Jira work item that justifies it.

## Language

**Ticket ID**:
A Jira work item key in the `GEN` project, written `GEN-<digits>`. It names why a
change exists. `GEN-000` and `GEN-0000` are not Ticket IDs — they are placeholders,
and a placeholder is the absence of a Ticket ID.
_Avoid_: ticket number, issue id, Jira id, story number

**Branch Type**:
The first path segment of a branch name, drawn from a closed set: `feature`,
`bugfix`, `hotfix`, `release`, `support`, `chore`, `docs`. Exactly one name exists
per concept.
_Avoid_: feat, fix, cxr, security, prefix, category

**Exempt Branch Type**:
A Branch Type whose name cannot carry a single Ticket ID, so it carries none: `release`,
`support` and `stable`, which are named for a version or a Version Line, and `backport`,
whose commits already carry the Ticket ID of the change they copy.

**Ticket-Bearing Commit**:
A commit whose subject opens with a bracketed Ticket ID ahead of the Conventional
Commit form — `[GEN-10459] feat(cxr): lower unmuted-autoplay volume`. The Ticket ID
belongs on the subject, never in the body or a trailer, because the subject becomes
the pull request title under squash-merge.

**Auto-injection**:
Deriving the Ticket ID from the current branch and writing it into the commit
subject on the developer's behalf, so a Ticket ID is stated once per branch instead
of once per commit. Auto-injection is idempotent — a subject that already opens with
a Ticket ID is left alone.
_Avoid_: prefixing, rewriting, stamping

**Grandfathered Branch**:
A branch that existed before enforcement began, named in a committed snapshot.
A Grandfathered Branch is excused from the Ticket ID requirement only — because
satisfying it would mean renaming the branch. Every other message rule still
applies, since none of them require a rename. The snapshot is a closed historical
record, expected to be deleted once those branches have merged.
_Avoid_: legacy branch, exempt branch, whitelisted branch

**Trunk**:
The one branch every change lands on first: `develop`. Until the branching migration's
cutover, `release/genuin-sdk/2.0.6` stands in for it.
_Avoid_: release train, mainline

**Version Line**:
A long-lived, actively maintained `stable/<package>/<version>` branch that produces the
builds behind one published SDK channel, such as `stable/web-sdk/2.0.5`. It receives
selected backports and is never merged wholesale into the Trunk.
_Avoid_: support branch, release branch, release train
