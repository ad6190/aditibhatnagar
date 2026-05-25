# Parallelization Guide: Sub-Agents & Worktrees

When features are large or complex, parallelize work across multiple sub-agents working in isolated worktrees, then merge results.

---

## When to Parallelize

### Sequential (< 3 files touched)
```
/plan-issue 1 → /build-issue 1 → /generate-tests 1
```
Small features run sequentially. Simple, fast, no coordination needed.

### Parallel (3-8 files, independent changes)
```
Main Agent (orchestrator)
├─ Sub-agent 1: Build Feature Area A (worktree-a)
├─ Sub-agent 2: Build Feature Area B (worktree-b)
└─ Sub-agent 3: Build Feature Area C (worktree-c)
Then merge: A + B + C → main
```

### Large Parallel (8+ files, multiple subsystems)
```
Main Agent
├─ Sub-agent 1: Database schema (worktree-db)
├─ Sub-agent 2: API endpoints (worktree-api)
├─ Sub-agent 3: Frontend UI (worktree-ui)
├─ Sub-agent 4: Tests (worktree-tests)
└─ Sub-agent 5: Documentation (worktree-docs)

Merge order: db → api → ui → tests → docs → main
```

---

## Example: "Add User Authentication"

This is a large feature that benefits from parallelization:

### Features Breakdown
- Database schema (users table, sessions table)
- Backend API (login, logout, signup endpoints)
- Password hashing and validation
- Frontend login/signup UI
- Email verification flow
- Tests for all components

### Sequential Approach (Slow)
```
Plan → Build (one agent, all subsystems) → Tests → Deploy
Takes: 5-7 days (bottleneck: one builder)
```

### Parallel Approach (Fast)
```
Plan → Build (5 sub-agents in parallel) → Tests → Deploy
Takes: 2-3 days (5x parallelism, minus merge overhead)
```

---

## How to Use Sub-Agents in an Agent

### In the Planner Agent

The Planner can spawn sub-agents to analyze different parts:

```markdown
# Plan for Issue #1: User Authentication

When the feature is complex, I (Planner) spawn sub-agents:

## Sub-Agent Approach

For large features, spawn parallel sub-agents:
- Sub-agent 1 analyzes database design (schema, indexes, migrations)
- Sub-agent 2 analyzes API architecture (endpoints, auth flow, validation)
- Sub-agent 3 analyzes frontend (components, state management, routing)

Each sub-agent produces a mini-plan for their subsystem.

Then merge into one comprehensive plan.

## How to Invoke Sub-Agents

In your prompt to me (the Planner), say:

"This feature is complex. Spawn parallel sub-agents to plan:
1. Database schema design
2. API endpoints and authentication flow
3. Frontend login UI and state management

Each sub-agent produces a plan for their subsystem in ~15 minutes.
Then merge all plans into docs/plans/1.md"

Or simply:

"For issue #1, use sub-agents to parallelize planning if the feature is complex."
```

### In the Builder Agent

The Builder can spawn sub-agents for implementation:

```markdown
# Build for Issue #1: User Authentication

When the feature is large, I (Builder) spawn sub-agents:

## Parallel Implementation

For large features, spawn parallel sub-agents to work in parallel worktrees:

- Sub-agent 1 implements database schema in worktree-db
- Sub-agent 2 implements API endpoints in worktree-api
- Sub-agent 3 implements frontend UI in worktree-ui

Each sub-agent:
1. Creates/uses a dedicated worktree (isolated branch)
2. Implements their subsystem
3. Commits to their branch
4. Returns when complete

Then main agent:
1. Merges all branches into main
2. Runs full lint/build/test
3. Final commit to main

## How to Invoke Sub-Agents

In your prompt to me (the Builder), say:

"This is a large feature (8+ files). Use parallel sub-agents with worktrees:
1. Sub-agent 1: Implement database schema (worktree-db)
2. Sub-agent 2: Implement API (worktree-api)
3. Sub-agent 3: Implement frontend (worktree-ui)

Each sub-agent works independently, then merge."

Or simply:

"For issue #1, if the feature is large, use parallel sub-agents with worktrees."
```

---

## Worktree Management

### Creating Worktrees

```bash
# Main agent creates worktrees for sub-agents
cd test-repo

# Sub-agent 1 gets its own worktree
git worktree add .claude/worktrees/auth-db -b feature/auth-db

# Sub-agent 2 gets its own worktree
git worktree add .claude/worktrees/auth-api -b feature/auth-api

# Sub-agent 3 gets its own worktree
git worktree add .claude/worktrees/auth-ui -b feature/auth-ui

# Each sub-agent works in its directory:
# - Sub-agent 1: test-repo/.claude/worktrees/auth-db/
# - Sub-agent 2: test-repo/.claude/worktrees/auth-api/
# - Sub-agent 3: test-repo/.claude/worktrees/auth-ui/
```

### Sub-Agent Workflow

Each sub-agent:
```bash
# Work in their worktree
cd /path/to/worktree/

# Make changes
# Edit files, create files, etc.

# Commit
git add -A
git commit -m "feat(auth-db): Create users and sessions tables

Related: Issue #1"

# Push their branch
git push origin feature/auth-db

# Report completion
echo "✅ Database schema complete. Ready to merge."
```

### Merging Worktrees

Main agent after sub-agents complete:
```bash
cd test-repo

# Merge each sub-agent's branch
git merge feature/auth-db
git merge feature/auth-api
git merge feature/auth-ui

# Run full test suite
npm run lint
npm run build
npm run test -- --run

# If all pass, final commit
git commit -m "feat: Add user authentication

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

---

## Communication Pattern: Main Agent ↔ Sub-Agents

### Main Agent to Sub-Agents

```
"Sub-agent [1,2,3], your tasks are:

Issue: #1 User Authentication

Sub-agent 1 (Database):
- Task: Implement users and sessions tables
- Worktree: feature/auth-db
- Files: src/db/schema.sql, src/migrations/001_auth.sql
- Plan: [reference docs/plans/1.md#database-section]
- Acceptance: [checklist from plan]

Sub-agent 2 (API):
- Task: Implement login, logout, signup endpoints
- Worktree: feature/auth-api
- Files: src/api/auth.ts, src/lib/password.ts
- Plan: [reference docs/plans/1.md#api-section]
- Acceptance: [checklist from plan]

Sub-agent 3 (Frontend):
- Task: Implement login/signup UI
- Worktree: feature/auth-ui
- Files: src/components/LoginForm.tsx, src/pages/Signup.tsx
- Plan: [reference docs/plans/1.md#frontend-section]
- Acceptance: [checklist from plan]

Work independently. When done, report completion.
I will merge all branches."
```

### Sub-Agent to Main Agent

```
"✅ Sub-agent 1 (Database) complete!

Completed:
- Created users table with email, password_hash
- Created sessions table with user_id, token
- Added migration 001_auth.sql
- Ran migrations (no errors)
- Committed: feature/auth-db

Verification:
- [x] Tables exist and are correct structure
- [x] Foreign keys work
- [x] Migrations run cleanly
- [x] npm run build passes

Ready to merge."
```

---

## Ordering Dependencies

Some work depends on other work. Merge in order:

```
For User Authentication:
1. Database first (schema must exist)
   - Merge feature/auth-db
2. API next (uses database)
   - Merge feature/auth-api
3. Frontend last (calls API)
   - Merge feature/auth-ui
4. Tests (test completed feature)
   - Run test-generator
```

**Key:** Don't merge UI before API, or API before database.

---

## Error Handling

### If a Sub-Agent's Work Fails

```
Sub-agent 2 reports:
"❌ Sub-agent 2 (API) failed!

Error: npm run build failed with TS errors in src/api/auth.ts
- Line 42: Type 'User' has no property 'id'
- Line 67: Cannot find module 'bcrypt'

Status: Blocked. Needs:
1. Check User type (should have id?)
2. Install bcrypt: npm install bcrypt

Main agent, please advise."
```

**Main agent options:**
1. Tell sub-agent to fix and retry
2. Help sub-agent fix (spawn a helper sub-agent)
3. Merge other work first, come back to this

### If Merge Conflicts Occur

```
After merging feature/auth-db and feature/auth-api:
git merge feature/auth-ui
→ Conflict in src/App.tsx (both modified imports)

Main agent resolution:
1. Manually resolve conflict (read both versions)
2. Test merged result
3. Commit merge
```

---

## Performance Expectations

### Speedup

With proper parallelization:
- 2 sub-agents: ~1.8x speedup (not 2x due to merge overhead)
- 3 sub-agents: ~2.4x speedup
- 5 sub-agents: ~3.5x speedup (diminishing returns)

### When It Works Best

✅ **Good for parallelization:**
- Database changes + API changes + UI changes (independent)
- Frontend components (can build independently)
- Documentation + tests (once code is done)

❌ **Bad for parallelization:**
- Highly coupled code (A depends on B depends on C)
- Single large file (can't split edits)
- Changes that require constant merging

---

## Template for Large Feature Prompts

When you have a large feature, prompt like this:

```
I'm planning/building a large feature (Issue #1: User Authentication).

This feature spans:
- Database schema (users, sessions)
- API endpoints (login, logout, signup)
- Frontend UI (LoginForm, SignupPage)
- Email verification (background job)

Use parallel sub-agents with worktrees to speed this up:

1. Sub-agent 1 (DB): Implement schema in worktree-db
2. Sub-agent 2 (API): Implement endpoints in worktree-api  
3. Sub-agent 3 (UI): Implement components in worktree-ui

Each works independently. When all are done, merge in order:
db → api → ui → main

Report completion when ready."
```

---

## For Your Team Session

**Teaching point:** "Big features don't have to be slow. By breaking them into independent sub-agents with isolated worktrees, we can 3-5x speed up development while keeping everything organized and mergeable."

---

**Last updated:** 2026-05-25
