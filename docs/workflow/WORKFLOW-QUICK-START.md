# AI-Native SDLC Workflow — Quick Start

## Files Created

### ✅ Codebase Context
- `test-repo/CLAUDE.md` — Blog stack documentation (read by all agents)

### ✅ Agents (4 reusable prompts)
- `.claude/agents/planner.md` — Reads issue, produces plan
- `.claude/agents/builder.md` — Implements plan, commits code
- `.claude/agents/reviewer.md` — Reviews code vs acceptance criteria
- `.claude/agents/test-generator.md` — Generates tests with Vitest

### ✅ Skills (Single-command shortcuts)
- `/plan-issue <number>` — Invokes planner agent
- `/build-issue <number>` — Invokes builder agent
- `/review-pr <number>` — Invokes reviewer agent

### ✅ Automation
- `.claude/hooks/auto-pr.sh` — Auto-creates draft PR when builder commits
- `.claude/settings.local.json` — Permissions + hook configuration

### ✅ Documentation
- `CLAUDE.md` — This workflow (what you're reading)
- `WORKFLOW-QUICK-START.md` — This quick start

---

## Prerequisite: Authenticate GitHub CLI

```bash
gh auth login
# Choose HTTPS
# Create a personal access token with repo, read:org scopes
```

Verify:
```bash
gh auth status
```

---

## Demo: "Add Dark Mode Toggle"

### 1. Create Issue
```bash
cd test-repo
gh issue create \
  --title "Add dark mode toggle to navigation" \
  --body "Users want to switch between light and dark themes. Persist preference to localStorage."
```
This creates issue #1.

### 2. Plan Feature
```
/plan-issue 1
```
Planner agent:
- Reads issue #1
- Reads `test-repo/CLAUDE.md`
- Analyzes Navigation.tsx, App.tsx, etc.
- Posts plan as GitHub issue comment

**Action:** Open the GitHub issue, read the plan comment, approve.

### 3. Build Feature
```
/build-issue 1
```
Builder agent:
- Reads issue #1 and plan comment
- Creates `src/lib/theme.ts` (context provider)
- Edits Navigation.tsx (add toggle button)
- Edits App.tsx (wrap with provider)
- Edits CommentSection.tsx (watch theme)
- Runs lint & build checks
- Commits: `git commit -m "feat: Add dark mode toggle\n\nCloses #1"`
- Pushes to main

**Auto-action:** Stop hook fires → draft PR created on GitHub

### 4. Review Code
```
/review-pr 1
```
Reviewer agent:
- Reads PR #1 and plan
- Checks acceptance criteria from plan
- Posts review (blockers vs suggestions)

**Action:** Open the PR, read review comment.

### 5. Generate Tests (Optional)
```
Direct prompt: "Use the test-generator agent to test Navigation.tsx"
```
Test-generator agent:
- Scaffolds Vitest (if not present)
- Generates tests for Navigation component
- Happy path, edge cases, accessibility
- Runs tests until all pass

**Result:** Tests added to `src/__tests__/Navigation.test.tsx`

### 6. Deploy
Code is already on `main` (step 3), so GitHub Actions auto-deploys to GitHub Pages.

---

## What Each Command Does

| Command | Agent | Input | Output |
|---------|-------|-------|--------|
| `/plan-issue 1` | planner | GitHub issue #1 | Plan comment on issue #1 |
| `/build-issue 1` | builder | GitHub issue #1 + plan | Code committed, draft PR created |
| `/review-pr 1` | reviewer | GitHub PR #1 | Review comment on PR #1 |

---

## What the Workflow Teaches

1. **Context reuse** — `CLAUDE.md` is the single source of truth. Agents don't re-explore.
2. **Separated phases** — Planning ≠ building ≠ reviewing. Humans review before code changes.
3. **Acceptance criteria** — Every change is verified against a checklist.
4. **Safe automation** — Draft PRs prevent accidental merges.
5. **Asynchronous work** — No back-and-forth chat needed. Each phase is independent.
6. **Durable documentation** — Everything is in `.md` files, not chat history.

---

## For Your Team Session

Suggested flow:

1. **Show the structure** — Walk through the directory layout
   - Agents in `.claude/agents/`
   - Skills in `.claude/skills/`
   - Context in `test-repo/CLAUDE.md`

2. **Live demo** — Run through steps 1-4 (plan → build → review)
   - Create issue
   - Show plan comment on GitHub
   - Show builder commit + auto-PR
   - Show review comment

3. **Discuss principles** — What each agent does and why
   - Planner: "Planning before building prevents rework"
   - Builder: "Scope discipline — follow the plan exactly"
   - Reviewer: "Objective checklist, not subjective feedback"
   - Test-generator: "Generate tests after features, not before"

4. **Hands-on** — Let team try creating their own issue and running `/plan-issue`

---

## Files to Share with Team

- `CLAUDE.md` — Full workflow explanation
- `WORKFLOW-QUICK-START.md` — This file
- `.claude/agents/*.md` — Agent documentation
- `.claude/skills/*.md` — Skill documentation
- `test-repo/CLAUDE.md` — Codebase context example

---

## Tips

- **Keep `test-repo/CLAUDE.md` updated** — It's the foundation. When your stack changes, update it.
- **Customize agents** — Edit `.claude/agents/*.md` to match your team's style.
- **Add more skills** — Create `.claude/skills/my-skill.md` for common workflows.
- **Monitor the hook** — Check `.claude/hooks/auto-pr.sh` if PRs aren't auto-creating.

---

## Next Steps

1. ✅ Run `gh auth login` to authenticate GitHub CLI
2. ✅ Run through the demo (steps 1-4 above)
3. ✅ Try the workflow on a real feature from your backlog
4. ✅ Customize agents and add team-specific patterns

---

**Ready to demo?** Create an issue and run `/plan-issue 1`!
