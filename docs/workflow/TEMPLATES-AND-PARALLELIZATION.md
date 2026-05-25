# Templates & Parallelization for Large Features

This document explains how to use templates for consistent documentation and how to parallelize large features using sub-agents and worktrees.

---

## Part 1: Templates

Templates ensure consistent documentation across all features. Agents read and follow these templates.

### Available Templates

1. **PRD-TEMPLATE.md** (`docs/templates/PRD-TEMPLATE.md`)
   - Used by: Specifier agent
   - Sections: Problem statement, acceptance criteria, user stories, design, dependencies, risks, timeline, budget, rollback
   - When: Every feature gets a PRD

2. **ADR-TEMPLATE.md** (`docs/templates/ADR-TEMPLATE.md`)
   - Used by: Scaffolder (initial setup) + Specifier (new decisions per feature)
   - Sections: Context, decision, consequences, alternatives, implementation notes
   - When: Major architectural decisions (state management, framework choice, data persistence)

### How Agents Use Templates

**Specifier Agent:**
```
1. Reads docs/templates/PRD-TEMPLATE.md
2. Fills in sections for the feature
3. Creates docs/PRD.md and docs/spec/<issue>.md
4. If new architectural decision → creates docs/ADRs/<number>-<title>.md using ADR template
```

**Scaffolder Agent:**
```
1. Reads docs/templates/ADR-TEMPLATE.md
2. For each existing architectural decision, creates an ADR
3. Places in docs/ADRs/001-*, 002-*, etc.
```

**Example: Dark Mode Feature**

PRD template used:
```
## Problem Statement
Users report eye strain at night

## Acceptance Criteria
- [ ] Toggle button in nav
- [ ] Theme persists
- [ ] Giscus adapts

## User Stories
As a night user, I want dark mode...

## Design & Architecture
Toggle in top-right, sun/moon icon
React Context for state
localStorage for persistence

## Dependencies
- Tailwind dark mode (already enabled)
- Giscus (already integrated)

## Risks
- Giscus iframe flicker
- incognito mode (localStorage disabled)

## Timeline
- Spec: 1 day
- Planning: 1 day
- Implementation: 1-2 days
- Testing: 1 day

## Success Metrics
- >30% of sessions use dark mode
- No support tickets about theme persistence
```

ADR created (if new decision):
```
# ADR 003: React Context for Theme State

## Context
We need to manage theme state (light/dark) across the app.

## Decision
We will use React Context (not Redux or other state management).

## Consequences
**Pros:**
- Lightweight, no extra dependency
- Perfect for this use case (global toggle)
- Familiar to team (React built-in)

**Cons:**
- Not scalable for complex state
- Doesn't solve prop drilling for large apps

## Alternatives Considered
- Redux (overkill for this feature)
- Zustand (nice but unnecessary)
- MobX (too complex)
```

---

## Part 2: Parallelization for Large Features

When a feature is large (8+ files, multiple subsystems), use parallel sub-agents with worktrees to 3-5x speed up development.

### When to Parallelize

| Feature Size | Approach | Benefit |
|--------------|----------|---------|
| Tiny (1-2 files) | Sequential | Simple, no overhead |
| Small (3-7 files) | Sequential or Parallel | Usually sequential is fine |
| Large (8+ files, independent) | Parallel with sub-agents | 3-5x speedup |
| Coupled (8+ files, highly interdependent) | Sequential | Parallelization doesn't help |

### Example: User Authentication (Large Feature)

**Sequential approach (slow):**
```
Planner → Builder (one builder, all subsystems) → Tests
Takes: 5-7 days
Bottleneck: One builder doing everything
```

**Parallel approach (fast):**
```
Planner → Parallel Builders:
├─ Sub-builder 1: Database (worktree-db)
├─ Sub-builder 2: API (worktree-api)
└─ Sub-builder 3: Frontend (worktree-ui)
→ Tests
Takes: 2-3 days
Speedup: ~2.5x with 3 sub-agents
```

### How to Trigger Parallelization

**In your prompt to the Planner agent:**
```
"Issue #1: User Authentication. This is a large feature.

Use parallel sub-agents to plan:
1. Sub-agent 1: Database schema design
2. Sub-agent 2: API authentication flow
3. Sub-agent 3: Frontend login UI

Each sub-agent produces a mini-plan. Merge into docs/plans/1.md"
```

**In your prompt to the Builder agent:**
```
"Issue #1: User Authentication. This is a large feature.

Use parallel sub-agents with worktrees:
1. Sub-agent 1: Implement database (worktree-db)
2. Sub-agent 2: Implement API (worktree-api)
3. Sub-agent 3: Implement frontend (worktree-ui)

Each works independently. When done, merge all into main."
```

### Worktree Management

**Creating worktrees for sub-agents:**
```bash
cd test-repo

# Create worktree for each sub-agent
git worktree add .claude/worktrees/auth-db -b feature/auth-db
git worktree add .claude/worktrees/auth-api -b feature/auth-api
git worktree add .claude/worktrees/auth-ui -b feature/auth-ui

# Each sub-agent works in their directory:
# Sub-agent 1: test-repo/.claude/worktrees/auth-db/
# Sub-agent 2: test-repo/.claude/worktrees/auth-api/
# Sub-agent 3: test-repo/.claude/worktrees/auth-ui/
```

**Sub-agent workflow:**
```bash
# Work in worktree
cd /path/to/worktree/

# Make changes, commit
git add -A
git commit -m "feat(auth-db): Create users and sessions tables

Related: Issue #1"

# Push branch
git push origin feature/auth-db
```

**Main agent merges:**
```bash
cd test-repo

# Merge all sub-agent branches
git merge feature/auth-db
git merge feature/auth-api
git merge feature/auth-ui

# Test merged result
npm run lint
npm run build
npm run test -- --run

# Final commit
git commit -m "feat: User authentication

Merges:
- Database schema
- API endpoints
- Frontend UI

Closes #1"

git push origin main

# Clean up worktrees
git worktree remove .claude/worktrees/auth-db
git worktree remove .claude/worktrees/auth-api
git worktree remove .claude/worktrees/auth-ui
```

### Communication Between Sub-Agents

**Main agent → Sub-agents:**
```
"You are sub-agents for Issue #1: User Authentication

Sub-agent 1 (Database):
- Task: Implement users and sessions tables
- Worktree: feature/auth-db
- Location: src/db/schema.sql, migrations/001_auth.sql
- Acceptance:
  - [ ] users table with email, password_hash
  - [ ] sessions table with user_id, token
  - [ ] Migrations run cleanly
  - [ ] npm run build passes

Sub-agent 2 (API):
- Task: Implement login, logout, signup endpoints
- Worktree: feature/auth-api
- Location: src/api/auth.ts, src/lib/password.ts
- Acceptance:
  - [ ] POST /api/auth/signup works
  - [ ] POST /api/auth/login works
  - [ ] POST /api/auth/logout works
  - [ ] npm run build passes

Sub-agent 3 (Frontend):
- Task: Implement LoginForm, SignupPage
- Worktree: feature/auth-ui
- Location: src/components/LoginForm.tsx, src/pages/Signup.tsx
- Acceptance:
  - [ ] Components render without errors
  - [ ] Form validation works
  - [ ] API calls work
  - [ ] npm run build passes

Work independently. When done, commit and report."
```

**Sub-agent → Main agent:**
```
"✅ Sub-agent 1 (Database) complete!

Completed:
- Created users and sessions tables
- Added migration 001_auth.sql
- Tables verified (schema correct)
- npm run build: PASS

Status: Ready to merge. Pushed to feature/auth-db"
```

### Merge Order Matters

Some subsystems depend on others. Merge in the right order:

```
For User Authentication:
1. Database first (API depends on it)
   git merge feature/auth-db
2. API next (Frontend depends on it)
   git merge feature/auth-api
3. Frontend last
   git merge feature/auth-ui

Wrong order → compilation errors or missing APIs.
```

### Error Handling

If a sub-agent's work fails:
```
Sub-agent 2: "❌ API build failed!

Error: TS2307 Cannot find module 'bcrypt'

Status: Blocked. Needs:
- npm install bcrypt
- OR check why bcrypt isn't in package.json"
```

**Main agent can:**
1. Tell sub-agent to fix and retry
2. Spawn a helper to fix it
3. Merge other work first, come back to this

---

## Combining Templates + Parallelization

### For a Large Feature

```
Step 1: Specify Feature
- Specifier reads docs/templates/PRD-TEMPLATE.md
- Creates comprehensive PRD
- Creates ADRs for new architectural decisions
- Output: docs/PRD.md, docs/spec/1.md, docs/ADRs/003-*.md

Step 2: Plan Feature (Parallel)
- Planner spawns 3 sub-planners
- Each plans a subsystem
- Merge plans into docs/plans/1.md

Step 3: Build Feature (Parallel)
- Main builder spawns 3 sub-builders with worktrees
- Each implements a subsystem independently
- Merge branches in order: db → api → ui

Step 4: Test Feature
- Test-Generator creates comprehensive tests
- All tests pass

Step 5: Deploy
- Merge PR to main
- GitHub Pages auto-deploys
```

**Total time:** ~3-4 days for large feature (vs 7-10 days sequential)

---

## Quick Reference

### Template Usage

| Template | Agent | Output | When |
|----------|-------|--------|------|
| PRD-TEMPLATE.md | Specifier | docs/PRD.md | Every feature |
| ADR-TEMPLATE.md | Scaffolder + Specifier | docs/ADRs/*.md | Major decisions |

### Parallelization Decision

- **Feature size:** 1-3 files → Sequential
- **Feature size:** 3-7 files → Sequential or parallel (your choice)
- **Feature size:** 8+ independent files → Parallel (strongly recommended)

### Sub-Agent Checklist

Use when:
- [ ] Feature is large (8+ files)
- [ ] Subsystems are independent (database ≠ API ≠ frontend)
- [ ] You want to save 3-5x time

Don't use when:
- [ ] Feature is small (< 3 files)
- [ ] Code is highly coupled (changes everywhere)
- [ ] Sub-agents would just slow things down

---

## For Your Team Session

**Teaching points:**

1. **Templates** → Consistency
   - "Every PRD follows the same format. Team knows what to expect."
   - "Every ADR explains a decision. No tribal knowledge."

2. **Parallelization** → Speed
   - "Big features don't have to be slow. 3 sub-agents = 2.5x speedup."
   - "Each sub-agent works independently in a worktree. No conflicts."

3. **Together** → Efficiency
   - "Templates + parallelization = consistent, fast feature development."

---

**Last updated:** 2026-05-25
