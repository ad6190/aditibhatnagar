# AI-Native SDLC Workflow — Team Guide

This guide documents an AI-native software development lifecycle (SDLC) workflow for your team. It demonstrates how to use Claude Code agents, skills, and hooks to build features collaboratively with AI assistance.

## Quick Start: Feature Development Cycle

The workflow is simple:
1. **Plan** — Claude analyzes the feature request and creates a structured plan
2. **Human Review** — Team reviews the plan on GitHub
3. **Build** — Claude implements the plan exactly as specified
4. **Review** — Claude reviews the code against the acceptance criteria
5. **Test** — Claude generates tests for the new feature
6. **Deploy** — Push to main (GitHub Pages auto-deploys)

## The Five SDLC Patterns

This workflow demonstrates all five core patterns from the course:

### 1. Reverse-Engineer with Context
**Files involved:** `test-repo/CLAUDE.md`, `.claude/agents/planner.md`

Agents don't re-explore the codebase on every run. Instead, they read a single context document (`CLAUDE.md`) that covers:
- Technology stack
- Directory structure
- Key files and their purposes
- Build/deploy process
- Known gotchas

This is **asymmetric knowledge transfer** — humans document the codebase once; agents read it many times.

### 2. Test-First Refactoring
**Files involved:** `.claude/agents/test-generator.md`, `.claude/skills/test-generator.md` (optional skill)

Tests are generated *after* features are built, not before. This is "test-driven quality" rather than "test-driven development." The agent:
- Scaffolds Vitest if not present
- Generates comprehensive tests (happy path, edge cases, accessibility)
- Runs tests and fixes failures
- Reports coverage

### 3. Agent-Building
**Files involved:** `.claude/agents/planner.md`, `.claude/agents/builder.md`, `.claude/agents/reviewer.md`, `.claude/agents/test-generator.md`

Four agents, each with a single responsibility:
- **Planner** — reads issue, produces plan
- **Builder** — reads plan, implements code
- **Reviewer** — checks code against acceptance criteria
- **Test-Generator** — generates tests

Each agent is a reusable prompt pattern documented in Markdown. They can be invoked directly or via skills.

### 4. Hooks for Safety Automation
**Files involved:** `.claude/hooks/auto-pr.sh`, `.claude/settings.local.json`

The `auto-pr.sh` hook runs automatically after the builder commits. It checks if the commit message references an issue (e.g., "Closes #1") and auto-creates a draft PR if one doesn't exist.

This is **safe automation** — the PR is draft-only, so humans still review before merging.

### 5. Memory & Documentation
**Files involved:** `test-repo/CLAUDE.md`, `.claude/agents/*.md`, `.claude/skills/*.md`

All context, patterns, and instructions are documented in Markdown files:
- `CLAUDE.md` files for codebase context
- Agent `.md` files for reusable prompts
- Skill `.md` files for single-command shortcuts

Nothing is in chat history; everything is in durable, searchable, versionable files.

---

## How to Use This Workflow

### Setup (One-time)

1. **Authenticate GitHub CLI:**
   ```bash
   gh auth login
   ```
   Select HTTPS, create a personal access token with `repo`, `read:org` scopes.

2. **Verify permissions:**
   Agents need permission to run `gh` commands, `npm` commands, and `git` commands. These are pre-authorized in `.claude/settings.local.json`.

3. **Check codebase context:**
   Read `test-repo/CLAUDE.md` to ensure it's up-to-date with your tech stack.

### Feature Development

**Scenario: "Add a dark mode toggle to the blog navigation"**

#### Step 1: Create a GitHub Issue
```bash
cd test-repo
gh issue create \
  --title "Add dark mode toggle to navigation" \
  --body "Users want to switch between light and dark themes. The preference should persist across sessions."
```
This creates issue #1 on GitHub.

#### Step 2: Plan the Feature
```
/plan-issue 1
```
Claude invokes the planner agent, which:
1. Fetches issue #1
2. Reads `test-repo/CLAUDE.md` for codebase context
3. Analyzes relevant files (Navigation.tsx, App.tsx, etc.)
4. Posts a structured plan as an issue comment on GitHub

**Review the plan on GitHub** — click the issue link, read the plan comment, approve if it looks good.

#### Step 3: Build the Feature
```
/build-issue 1
```
Claude invokes the builder agent, which:
1. Reads issue #1 and its plan comment
2. Implements the feature exactly as planned
3. Runs `npm run lint` and `npm run build` to verify
4. Commits: `git commit -m "feat: Add dark mode toggle to navigation\n\nCloses #1"`
5. Pushes: `git push origin main`

**The auto-PR hook fires automatically** — a draft PR is created on GitHub.

#### Step 4: Review the Code
```
/review-pr 1
```
Claude invokes the reviewer agent, which:
1. Reads PR #1 and the linked issue
2. Checks the code against the plan's acceptance criteria
3. Posts a structured review (blockers vs suggestions)

**Review the feedback on GitHub** — look at the PR review comment.

#### Step 5: Generate Tests (Optional)
If you want tests for the new feature:
```
/test-issue 1
```
(Note: This skill isn't pre-built; you'd invoke the test-generator agent directly)

Claude invokes the test-generator agent, which:
1. Reads the feature (Navigation.tsx) and the plan
2. Scaffolds Vitest if not present
3. Generates comprehensive tests (happy path, edge cases, accessibility)
4. Runs `npm run test -- --run` and fixes failures
5. Reports test coverage

#### Step 6: Deploy
Push is already done (step 3), so the feature goes live via GitHub Actions.

---

## Files & Their Purposes

### Codebase Context
- **`test-repo/CLAUDE.md`** — Documentation for the blog codebase. Agents read this first before any codebase exploration. Update this when you change the tech stack or directory structure.

### Agents (Reusable Prompts)
- **`.claude/agents/planner.md`** — Planning agent. Reads an issue, analyzes code, produces a structured plan. Used by `/plan-issue` skill.
- **`.claude/agents/builder.md`** — Building agent. Reads a plan, implements the feature, commits. Used by `/build-issue` skill.
- **`.claude/agents/reviewer.md`** — Review agent. Reviews a PR against acceptance criteria, posts feedback. Used by `/review-pr` skill.
- **`.claude/agents/test-generator.md`** — Test generation agent. Generates tests, scaffolds Vitest, runs tests.
- **`.claude/agents/reverse-engineer-and-document.md`** — Documentation generation agent. Creates CLAUDE.md files for new modules.

### Skills (Single-Command Shortcuts)
- **`.claude/skills/plan-issue.md`** — `/plan-issue <number>` → invokes planner agent
- **`.claude/skills/build-issue.md`** — `/build-issue <number>` → invokes builder agent
- **`.claude/skills/review-pr.md`** — `/review-pr <number>` → invokes reviewer agent

### Hooks & Automation
- **`.claude/hooks/auto-pr.sh`** — Runs on Stop event. Auto-creates a draft PR if the last commit references an issue.
- **`.claude/settings.local.json`** — Permissions and hook configuration. Pre-authorizes `gh`, `npm`, `git` commands and registers the auto-PR hook.

---

## What Each Agent Does

### Planner Agent (`.claude/agents/planner.md`)

**Input:** GitHub issue number

**Process:**
1. Read the issue (title, description)
2. Read `test-repo/CLAUDE.md` for stack context
3. Analyze relevant codebase files
4. Write a structured plan with:
   - Summary (one sentence)
   - Files to create/change
   - Approach (strategy)
   - Edge cases & risks
   - Acceptance criteria (checklist)
   - Out of scope (explicit exclusions)
5. Post plan as an issue comment

**Output:** Plan posted to GitHub issue

**Key principle:** Planning separates from building. Humans review the plan before code changes.

---

### Builder Agent (`.claude/agents/builder.md`)

**Input:** GitHub issue number (which has a plan comment)

**Process:**
1. Read the issue and extract the plan
2. Implement the feature exactly per the plan (no improvisation)
3. Run `npm run lint` and `npm run build` to verify
4. Commit: `git commit -m "feat: ...\n\nCloses #<number>"`
5. Push: `git push origin main`

**Output:** Code committed and pushed; auto-PR hook creates draft PR

**Key principle:** Builder follows the plan exactly. Scope creep is prevented by limiting changes to what the plan specifies.

---

### Reviewer Agent (`.claude/agents/reviewer.md`)

**Input:** PR number (from auto-created PR)

**Process:**
1. Read the PR and linked issue
2. Extract acceptance criteria from the plan
3. Review the diff against criteria
4. Distinguish:
   - **Blockers** (must fix before merge)
   - **Suggestions** (nice to have)
5. Post structured review to PR

**Output:** Review comment on GitHub PR

**Key principle:** Review is objective (checklist-driven against the plan), not subjective.

---

### Test-Generator Agent (`.claude/agents/test-generator.md`)

**Input:** File path or feature description (e.g., "Navigation.tsx")

**Process:**
1. Check if Vitest is configured; scaffold if not
2. Read the source file to understand what to test
3. Generate tests:
   - Happy path (feature works)
   - Edge cases (boundaries, null, undefined)
   - Error states (what if X fails?)
   - Accessibility (ARIA, keyboard navigation)
4. Write test file to `src/__tests__/<ComponentName>.test.tsx`
5. Run `npm run test -- --run` and fix failures

**Output:** Test file with comprehensive test coverage

**Key principle:** Tests are generated after the feature, not before. This is "test-driven quality" (verify the feature works) rather than "test-driven development" (design by tests).

---

## Team Session — Teaching Points

Use this workflow to teach your team:

1. **Separation of concerns:** Planning, building, reviewing are distinct phases. Each agent has one job.

2. **CLAUDE.md as the foundation:** Agents don't re-explore; they read context docs. This scales to large codebases.

3. **Asynchronous workflows:** Plan → review → build → review → test. Humans don't need to stay in a chat with Claude; each phase is independent.

4. **Auditable decisions:** Every decision (plan, code, review) is posted to GitHub. Anyone can read why a change was made.

5. **Safe automation:** Hooks auto-create draft PRs (not real PRs), so humans still review before code goes live.

6. **Reusable patterns:** The same planner/builder/reviewer pattern works for any feature. Agents are documentation + prompts, not magic.

---

## Example Session Script

Here's how to run through the workflow in a live team session:

```bash
# Step 1: Create issue
cd test-repo
gh issue create --title "Add dark mode toggle" --body "..."

# Step 2: Plan
/plan-issue 1
# (Point to GitHub, show the plan comment)

# Step 3: Approve plan (manually on GitHub)

# Step 4: Build
/build-issue 1
# (Watch the builder commit and push, then note the auto-PR)

# Step 5: Review
/review-pr 1
# (Show the structured review on GitHub)

# Step 6: Tests (optional)
# "Use the test-generator agent to test Navigation.tsx"
```

Pause between each step to explain what's happening and let the team see the GitHub updates.

---

## Troubleshooting

### "gh: command not found"
Install GitHub CLI: `brew install gh` and authenticate: `gh auth login`

### "Permission denied: auto-pr.sh"
Make the script executable: `chmod +x .claude/hooks/auto-pr.sh`

### "Lint/build failed"
The builder agent will report lint/build errors. Fix the code and re-run `/build-issue`.

### "PR not auto-created"
The hook runs on Stop. Ensure the commit message includes "Closes #<number>" (exact keywords matter).

### "Plan is too vague"
This is actually a feature — the planner agent will ask for clarification in the plan comment if the issue is ambiguous.

---

## Next Steps

After the team session:

1. **Try it on a real feature:** Pick a feature from your backlog, create an issue, and run through the cycle.

2. **Customize the agents:** Edit the `.md` files to match your team's style and requirements.

3. **Add more skills:** Create skills for common tasks (e.g., `git-revert`, `rollback`, `hotfix`).

4. **Extend the hooks:** Add hooks for code quality gates (e.g., run tests on every commit).

5. **Document your codebase:** Keep `CLAUDE.md` updated. This is the foundation for all agent work.

---

**Last updated:** 2026-05-25 | See plan at `/Users/aditibhatnagar/.claude/plans/jiggly-crafting-phoenix.md`
