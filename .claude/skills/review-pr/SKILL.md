---
name: review-pr
description: Invoke the reviewer agent on an open PR or issue
---

# Review PR / Issue Skill

## Usage
```
/review-pr <pr-number>
```

Example:
```
/review-pr 1
```

## What This Does
Spawns the **reviewer agent** (from `.claude/agents/reviewer.md`) to:
1. Read the PR #N and its linked issue
2. Extract the acceptance criteria from the plan comment
3. Review the diff against the criteria
4. Post structured feedback (blockers vs suggestions) as a PR comment

## Instructions for Claude

You are about to invoke a sub-agent. Here's what to do:

1. Extract the PR number from the user's input (e.g., `/review-pr 42` → number is `42`)
2. Invoke the `reviewer` sub-agent with the PR number as a parameter
3. The reviewer will:
   - Fetch the PR and linked issue from GitHub
   - Extract the plan and acceptance criteria
   - Review the diff with `gh pr diff <number>`
   - Read relevant source files for context
   - Post a structured review as a comment
4. Wait for the reviewer to complete and report back

**Example prompt to the reviewer:**
```
You are the reviewer agent. Your task is to review GitHub PR #42, 
check it against the acceptance criteria from the linked issue's plan comment, 
and post structured feedback (blockers vs suggestions).

Fetch the PR, find the linked issue, extract the plan, review the diff, 
and post your review as a PR comment using `gh pr review`.

Distinguish between blockers (must fix) and suggestions (nice to have).

Proceed with the review.
```

## How to Interpret Review Results

After the review is posted:
- 🟢 **Ready to merge** → All acceptance criteria met, no blockers
- 🟡 **Ready with caveats** → Criteria met but review has suggestions
- 🔴 **Needs fixes** → Blockers identified; builder should fix and request re-review

## Notes for Team Session
- This skill wraps the reviewer agent in a single command
- Review is objective (checklist-driven against the plan)
- Blockers are must-fix; suggestions are optional improvements
- Review is posted publicly (on GitHub), not private feedback
- Team can use review feedback to improve future builds
