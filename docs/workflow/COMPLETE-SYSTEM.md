# Complete System: From Slack to Production

Your AI-native SDLC system is now complete. Here's what you can do:

---

## The Complete Architecture

```
SLACK                    GITHUB                         CODEBASE
┌──────────────┐        ┌──────────────┐               ┌──────────┐
│ User runs:   │        │ GitHub       │               │ Deployed │
│ /start-      │        │ Issue #42    │               │ Feature  │
│ feature      │        │ PR #10       │               │ in Prod  │
│ "Add dark    │        │              │               │ ✅       │
│  mode"       │        │              │               │          │
└──────┬───────┘        └──────────────┘               └──────────┘
       │                      ▲                             ▲
       │                      │                             │
       └──────────────┬───────┤─────────────────────────────┘
                      │
              ORCHESTRATOR
              ─────────────
              (Master Conductor)
              
              Invokes in sequence:
              1. Specifier → PRD
              2. Planner → Plan
              3. Builder → Code
              4. Test-Generator → Playwright tests
              5. Reviewer → Code review
              6. [Rebuild loop if needed]
              7. Create draft PR
```

---

## Six Agents in Your System

| Agent | Trigger | Role | Output |
|-------|---------|------|--------|
| **Scaffolder** | Manual `/scaffold-project` | Extract codebase knowledge | `docs/CLAUDE.md`, `docs/architecture.md` |
| **Specifier** | Orchestrator (from Slack) | Product requirements | `docs/PRD.md`, `docs/spec/<issue>.md` |
| **Planner** | Orchestrator (after Specifier) | Technical breakdown | `docs/plans/<issue>.md` |
| **Builder** | Orchestrator (after Planner) | Implementation | Code commit + push |
| **Test-Generator** | Orchestrator (after Builder) | UI testing with Playwright | `src/__tests__/*.spec.ts` |
| **Orchestrator** | Slack: `/start-feature "..."` | Conduct entire workflow | GitHub issue + PR + Slack updates |

---

## How It Works: Slack to Production

### The User Experience

```
1️⃣ USER (in Slack):
   /start-feature Add dark mode toggle so users can use the blog at night

2️⃣ SLACK BOT (immediate response):
   ✅ Issue #42 created
   Starting feature workflow...

3️⃣ REAL-TIME UPDATES (every 5 min):
   ⏳ [10:00] Generating PRD...
   ✅ [10:05] PRD created
   ✅ [10:10] Plan created
   ✅ [10:20] Feature built
   ✅ [10:25] Tests passing (12/12 Playwright tests)
   ✅ [10:30] Code review approved
   ✅ [10:35] Draft PR #10 created

4️⃣ FINAL MESSAGE (after workflow):
   🎉 Feature workflow complete!
   
   Issue: #42 Add dark mode toggle
   PR: #10 (Draft, ready for review)
   
   Timeline: 35 minutes start-to-finish
   
   Links:
   - PRD: docs/PRD.md
   - Plan: docs/plans/42.md
   - Tests: 12/12 passing (Playwright)
   - PR: https://github.com/.../pull/10

5️⃣ HUMAN ACTION (on GitHub):
   - Reviews PR #10
   - Checks code, tests, docs
   - Approves and merges

6️⃣ PRODUCTION:
   - GitHub Actions deploy
   - Feature live ✅
```

---

## What Each Agent Does

### Scaffolder (One-Time Setup)
```
/scaffold-project test-repo
↓
Analyzes codebase:
  - Tech stack: React 19, Vite, Tailwind, Giscus
  - Architecture: SPA with Obsidian vault source
  - Key files: Navigation.tsx, App.tsx, CommentSection.tsx
  - Gotchas: Giscus needs specific config, Tailwind v4 nesting syntax
↓
Generates:
  ✅ docs/CLAUDE.md (full codebase docs)
  ✅ docs/architecture.md (system design)
  ✅ docs/ADRs/ (decision records)
  ✅ docs/tech-debt.md (known issues)
```

### Specifier (Per Feature - from Slack)
```
Orchestrator invokes Specifier:
↓
Specifier reads feature request: "Add dark mode toggle..."
↓
Generates PRD with template:
  ✅ Problem statement
  ✅ Acceptance criteria (checklist)
  ✅ User stories
  ✅ Design & architecture
  ✅ Dependencies
  ✅ Risks & unknowns
  ✅ Timeline & budget
  ✅ Rollback plan
↓
Output:
  ✅ docs/PRD.md (feature requirements)
  ✅ docs/spec/42.md (issue-specific)
  ✅ docs/ADRs/003-*.md (if new decision)
```

### Planner (Per Feature)
```
Orchestrator invokes Planner:
↓
Planner reads:
  - docs/PRD.md (what to build)
  - docs/CLAUDE.md (how the system works)
↓
Creates technical plan:
  ✅ Files to create/change
  ✅ Architecture approach
  ✅ Edge cases & risks
  ✅ Acceptance criteria checklist
↓
Output:
  ✅ docs/plans/42.md (technical breakdown)
```

### Builder (Per Feature)
```
Orchestrator invokes Builder:
↓
Builder reads:
  - docs/plans/42.md (what to build)
↓
Implements:
  1. Create/edit files exactly per plan
  2. Run npm run lint → PASS
  3. Run npm run build → PASS
  4. Commit: "feat: Add dark mode\n\nCloses #42"
  5. Push to main
↓
Output:
  ✅ Code committed and pushed
  ✅ Auto-hook creates draft PR
```

### Test-Generator (Per Feature - Real Browser Testing)
```
Orchestrator invokes Test-Generator:
↓
Test-Generator reads implemented feature
↓
Generates Playwright tests:
  ✅ Happy path (feature works)
  ✅ Edge cases (null, boundary, incognito)
  ✅ Error states (what if X fails?)
  ✅ Accessibility (keyboard, ARIA)
  ✅ Integration (theme + Giscus + UI)
↓
Runs tests:
  npm run test:ui
  ✅ 12/12 tests passing
↓
Output:
  ✅ src/__tests__/dark-mode.spec.ts
  ✅ All tests passing
```

### Reviewer (Per Feature)
```
Orchestrator invokes Reviewer:
↓
Reviewer reads:
  - Code diff
  - docs/PRD.md (acceptance criteria)
  - Test results
↓
Reviews:
  ✅ All acceptance criteria met?
  ✅ Code quality?
  ✅ Security?
  ✅ Performance?
  ✅ Test coverage?
↓
Output:
  ✅ Approved (no blockers)
  ❌ Blockers (needs fixes)
  ⚠️ Suggestions (nice-to-haves)
```

### Orchestrator (Master Conductor)
```
/start-feature "Add dark mode..."
     ↓
[Orchestrator]
  1. Create GitHub issue #42
  2. Invoke Specifier → wait for PRD
  3. Invoke Planner → wait for plan
  4. Invoke Builder → wait for code
     [if fails: rebuild loop]
  5. Invoke Test-Generator → wait for tests
     [if fails: rebuild loop]
  6. Invoke Reviewer → wait for review
     [if blockers: rebuild loop]
  7. Create draft PR #10
  8. Update issue with links
  9. Report to Slack
     ↓
[Status updates on Slack]
     ↓
[Human merges PR on GitHub]
     ↓
[GitHub Actions deploy]
```

---

## Playwright UI Tests (Real Browser Testing)

Instead of mocked unit tests, Test-Generator creates **real browser tests**:

```typescript
// src/__tests__/dark-mode.spec.ts

test('dark mode toggle works', async ({ page }) => {
  // Real browser
  await page.goto('http://localhost:3000');
  
  // User interacts
  const toggle = page.getByRole('button', { name: /toggle/i });
  await toggle.click();
  
  // Real DOM updates
  await expect(page.locator('html')).toHaveClass('dark');
  
  // Real Giscus iframe updates
  const giscusFrame = page.frameLocator('iframe[src*="giscus"]');
  await expect(giscusFrame.locator('[data-theme="dark"]')).toBeTruthy();
  
  // Real localStorage persists
  await page.reload();
  await expect(page.locator('html')).toHaveClass('dark');
});
```

**Why Playwright > Unit Tests:**
- Tests real behavior, not mocks
- Catches integration issues
- Tests accessibility (keyboard, ARIA)
- Tests actual localStorage, events, iframes
- Tests across browsers

---

## Skills (Shortcuts)

You can also run individual agents with skills:

```bash
/scaffold-project test-repo              # Scaffolder
/specify-feature "description"           # Specifier
/plan-issue 42                           # Planner
/build-issue 42                          # Builder
/generate-tests src/Component.tsx        # Test-Generator
```

But **Orchestrator automates all of them together** from Slack.

---

## Slack Integration

### Trigger
```
/start-feature Add dark mode toggle so users can use the blog at night
```

### Status Updates
```
⏳ [10:00] Creating issue...
✅ [10:05] PRD created
✅ [10:10] Plan created
✅ [10:20] Building...
✅ [10:25] Tests passing (12/12)
✅ [10:30] Review approved
✅ [10:35] Draft PR #10 created

🎉 Feature workflow complete!
Issue: #42
PR: #10
Timeline: 35 minutes
```

### Error Handling
```
⚠️ Build failed!

Error: TypeScript in Navigation.tsx
Line 42: Type 'User' has no property 'id'

Status: Retrying (attempt 2/3)
Invoking Builder to fix...

[waits]

✅ Build succeeded!
Proceeding...
```

---

## Documentation Generated

After running workflow, you have:

```
docs/
  CLAUDE.md                 # Codebase docs (Scaffolder)
  architecture.md           # System design
  PRD.md                    # Product requirements (Specifier)
  tech-debt.md              # Known issues
  templates/
    PRD-TEMPLATE.md         # Template for PRDs
    ADR-TEMPLATE.md         # Template for decisions
  spec/
    42.md                   # Issue #42 spec
  plans/
    42.md                   # Issue #42 technical plan
  ADRs/
    001-decision.md
    002-decision.md
    003-decision.md

src/
  __tests__/
    dark-mode.spec.ts       # Playwright tests (Test-Generator)

.github/
  pull/
    10                      # Draft PR (Orchestrator created)
```

---

## Timeline: Slack to Production

```
 0 min  → User: /start-feature "Add dark mode"
 1 min  → Issue #42 created
 5 min  → ✅ PRD created
10 min  → ✅ Technical plan created
20 min  → ✅ Code built and committed
25 min  → ✅ Playwright tests passing
30 min  → ✅ Code review approved
35 min  → ✅ Draft PR #10 created
40 min  → Human reviews PR on GitHub
45 min  → Human merges PR
50 min  → GitHub Actions deploy
55 min  → Feature live in production ✅

**Total: ~55 minutes from Slack to production**
(vs 2-3 days of manual work)
```

---

## Error Recovery

If something fails, Orchestrator auto-retries:

```
Attempt 1: Builder fails (TS error)
  ↓ Orchestrator passes error to Builder
Attempt 2: Builder fixes and rebuild succeeds
  ↓
Attempt 1: Tests fail (12/12 passing → 1 fails)
  ↓ Orchestrator passes test failures to Builder
Attempt 2: Builder fixes code, tests pass
  ↓
Attempt 1: Review has blockers
  ↓ Orchestrator passes blockers to Builder
Attempt 2: Builder fixes, re-tests, re-reviews → approved
  ↓
Create PR
```

**Max retries:** 3 loops per stage. After 3 failures, escalate to human.

---

## Key Files

### Core System
- `.claude/agents/orchestrator.md` — Master conductor
- `.claude/agents/scaffolder.md` — Codebase analyzer
- `.claude/agents/specifier.md` — Product planner
- `.claude/agents/planner.md` — Technical planner
- `.claude/agents/builder.md` — Coder
- `.claude/agents/test-generator.md` — Playwright tester
- `.claude/agents/reviewer.md` — Code reviewer

### Documentation
- `PROMPTS-VS-SKILLS-VS-HOOKS.md` — Concepts
- `WORKFLOW-ARCHITECTURE.md` — Five-stage workflow
- `PARALLELIZATION-GUIDE.md` — Sub-agents + worktrees
- `TEMPLATES-AND-PARALLELIZATION.md` — Templates + parallelization
- `SLACK-INTEGRATION.md` — Slack setup
- `ORCHESTRATOR-AND-PLAYWRIGHT.md` — Full automation
- `COMPLETE-SYSTEM.md` — This document

---

## Summary: What You Now Have

✅ **Six agents** — Each with one job (Scaffolder, Specifier, Planner, Builder, Test-Generator, Orchestrator)
✅ **Slack integration** — `/start-feature "description"`
✅ **Full automation** — Slack → GitHub issue → workflow → PR → production
✅ **Playwright testing** — Real UI tests, not mocks
✅ **Error recovery** — Auto-rebuild on failures
✅ **Durable docs** — PRDs, plans, ADRs in git
✅ **Templates** — Consistent PRD and ADR formats
✅ **Parallelization** — Sub-agents + worktrees for large features
✅ **Human approval gates** — Only humans merge to production

---

## For Your Team Session

### Teaching Narrative

1. **"One command from Slack starts everything"**
   - User: `/start-feature "Add dark mode"`
   - Orchestrator handles everything else

2. **"Six agents, each with one job"**
   - Specifier: Product spec
   - Planner: Technical plan
   - Builder: Code
   - Test-Generator: Playwright tests
   - Reviewer: Code review
   - Orchestrator: Conductor

3. **"Real UI tests, not mocks"**
   - Playwright tests actual browser behavior
   - Tests localStorage, iframes, accessibility
   - Tests integration (dark mode + Giscus)

4. **"35 minutes from Slack to production"**
   - vs 2-3 days manual
   - 3-5x speedup
   - Human approval still required (safe)

5. **"Error recovery is automatic"**
   - Builder fails → auto-rebuild
   - Tests fail → auto-rebuild
   - Review finds issues → auto-rebuild
   - Max 3 retries, then escalate

---

## Next Steps

1. **Setup Slack app** — Follow SLACK-INTEGRATION.md
2. **Try it on a real feature** — `/start-feature "feature description"`
3. **Watch the workflow** — Real-time status in Slack
4. **Review PR on GitHub** — Merge when ready
5. **Monitor deployment** — Feature goes live

---

**You now have a complete AI-native SDLC system. Ready to demo to your team! 🚀**

---

**Last updated:** 2026-05-25
