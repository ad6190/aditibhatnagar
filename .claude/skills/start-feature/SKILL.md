---
name: start-feature
description: End-to-end feature workflow - invokes the Orchestrator agent to create the issue (if needed), then runs Specifier → Planner → Builder → Test-Generator → Reviewer → draft PR
---

# Start Feature Skill

## Usage
```
/start-feature <feature-description | issue-number | github-issue-url>
```

Examples:
```
/start-feature Add dark mode toggle so users can read the blog at night
/start-feature 42
/start-feature #42
/start-feature https://github.com/ad6190/aditibhatnagar/issues/42
```

## What This Does

Invokes the **Orchestrator agent** to run the full AI-native SDLC workflow end-to-end:

1. **Parse input** — Detect whether the argument is a description, an issue number, or a GitHub issue URL
2. **Create or fetch issue** — If a description is provided, create a new GitHub issue; otherwise use the referenced one
3. **Invoke Specifier** — Produce `docs/PRD.md` and `docs/spec/<issue>.md`
4. **Invoke Planner** — Produce `docs/plans/<issue>.md`
5. **Invoke Builder** — Implement the feature, commit, and push
6. **Invoke Test-Generator** — Generate and run Playwright UI tests
7. **Invoke Reviewer** — Check the diff against acceptance criteria
8. **Handle errors** — On Builder failure, test failure, or review blockers, loop back to Builder (max 3 retries)
9. **Open draft PR** — Linked to the issue with PRD/plan/test references in the body
10. **Update issue** — Comment with the workflow summary and PR link

## Pre-requisites

- `gh` CLI authenticated (`gh auth login`)
- Codebase scaffolded — run `/scaffold-project <repo>` first so `docs/CLAUDE.md` exists
- Repo writable from this machine (orchestrator pushes commits and opens PRs)

## When to Use This Skill

**Use it when:**
- You want a hands-off run from a single sentence to a draft PR
- The feature is well-enough scoped that you trust the Specifier to write the PRD without you in the loop
- You want to demo the full workflow in one command (team sessions)

**Don't use it when:**
- You want to review the PRD before planning starts → run `/specify-feature` then `/plan-issue` instead
- You want to review the plan before code is written → run `/plan-issue` then `/build-issue` instead
- The feature is large or ambiguous → step-by-step skills give you more checkpoints

## Output

When the orchestrator finishes successfully:

- GitHub issue (new or existing) with a workflow-complete comment
- `docs/PRD.md`, `docs/spec/<issue>.md`
- `docs/plans/<issue>.md`
- Code committed and pushed to `main`
- Playwright tests under `src/__tests__/`
- Draft PR on GitHub linked to the issue
- Reviewer comment on the PR

If the orchestrator escalates (3 retries exhausted), it stops and reports the failure so a human can take over.

## Instructions for Claude

Extract the argument from the user's input.

Invoke the `orchestrator` sub-agent and pass the argument verbatim — the agent itself handles the three input forms (description / number / URL).

Do not run Specifier, Planner, Builder, etc. yourself; the orchestrator conducts them. Just hand off and report the final result (issue #, PR #, or escalation reason) back to the user.

## For Team Session

**Teaching point:** "One command, full cycle. Scaffold once with `/scaffold-project`, then every feature is `/start-feature <one sentence>` → draft PR. The orchestrator handles retries and status updates; humans only step in to merge."
