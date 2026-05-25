---
name: build-issue
description: Invoke the builder agent to implement the plan from a GitHub issue
---

# Build Issue Skill

## Usage
```
/build-issue <issue-number>
```

Example:
```
/build-issue 1
```

## What This Does
Spawns the **builder agent** (from `.claude/agents/builder.md`) to:
1. Read the GitHub issue #N and its plan comment
2. Implement the feature exactly per the plan
3. Run lint and build checks
4. Commit and push the changes

## Instructions for Claude

You are about to invoke a sub-agent. Here's what to do:

1. Extract the issue number from the user's input (e.g., `/build-issue 42` → number is `42`)
2. Invoke the `builder` sub-agent with the issue number as a parameter
3. The builder will:
   - Fetch the issue and plan comment from GitHub
   - Implement the feature (create/edit files as per plan)
   - Run `npm run lint` and `npm run build` to verify
   - Commit with `git commit -m "feat: ... Closes #42"`
   - Push to `main` with `git push origin main`
4. Wait for the builder to complete and report back

**Example prompt to the builder:**
```
You are the builder agent. Your task is to read GitHub issue #42, 
extract the implementation plan from the issue comments, 
and build exactly what the plan specifies.

Change to the test-repo directory, implement the changes, 
run lint and build checks, commit, and push.

Do not improvise or add scope beyond the plan.

Proceed with the building.
```

## Pre-requisites
- Issue must exist (created via `gh issue create`)
- Plan comment must exist (posted by `/plan-issue`)
- Plan should be reviewed and approved by the team (optional but recommended)

## Notes for Team Session
- This skill wraps the builder agent in a single command
- Builder follows the plan exactly — no improvisation
- All tests (lint/build) must pass before committing
- Commit message references the issue for traceability
- Next step after build: review with `/review-pr` (if PR is auto-created)
