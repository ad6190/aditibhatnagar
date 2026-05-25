# Implementation Summary: AI-Native SDLC Workflow (Enhanced)

## What Was Built

A complete, production-ready AI-native software development workflow that separates **product planning** from **technical planning** from **implementation**, with comprehensive documentation and test generation.

---

## Key Documents Created

### Educational Documents (For Team Understanding)
1. **PROMPTS-VS-SKILLS-VS-HOOKS.md**
   - Explains when to use prompts (one-off), skills (repeatable), hooks (automation)
   - Includes decision trees and real-world examples
   - Teaching points for your team session

2. **WORKFLOW-ARCHITECTURE.md**
   - Describes the five-stage workflow (Scaffolder → Specifier → Planner → Builder → Test-Generator)
   - Shows the separation between product thinking and technical thinking
   - Explains each agent's responsibility
   - Includes a realistic example (dark mode feature)

3. **WORKFLOW-COMPLETE.md**
   - Complete end-to-end flow with ASCII diagrams
   - Shows the five agents, five skills, and documentation structure
   - Step-by-step dark mode example
   - Why the workflow works

---

## Agents (5 Total)

### 1. Scaffolder Agent (`.claude/agents/scaffolder.md`)
**Purpose:** One-time project setup  
**Generates:**
- `docs/CLAUDE.md` — Full codebase documentation
- `docs/architecture.md` — System architecture
- `docs/ADRs/` — Architectural Decision Records
- `docs/tech-debt.md` — Known limitations

**Difference from old:** This is the renamed and enhanced "reverse-engineer-and-document" agent

---

### 2. Specifier Agent (`.claude/agents/specifier.md`) — **NEW**
**Purpose:** Product-level planning  
**Generates:**
- `docs/PRD.md` — Product Requirements Document
- `docs/spec/<issue>.md` — Issue-specific specification

**Focuses on:** User needs, acceptance criteria, user stories, design, dependencies, risks
**Key difference:** Product thinking BEFORE technical thinking

---

### 3. Planner Agent (`.claude/agents/planner.md`) — **UPDATED**
**Purpose:** Technical planning  
**Generates:**
- `docs/plans/<issue>.md` — Technical implementation plan (NOT GitHub comments)

**Key changes:**
- Now reads PRD from Specifier
- Reads codebase context from `docs/CLAUDE.md` (from Scaffolder)
- Saves plan to durable file location (`docs/plans/`) instead of GitHub comments
- Much more detailed because it's a contract with the Builder

---

### 4. Builder Agent (`.claude/agents/builder.md`) — **UPDATED**
**Purpose:** Implementation  
**Output:** Code committed and pushed

**Key changes:**
- Now reads technical plan from `docs/plans/<issue>.md`
- Follows plan exactly (no improvisation)
- More emphasis on discipline: "No thinking, just execution"

---

### 5. Test-Generator Agent (`.claude/agents/test-generator.md`) — **UPDATED**
**Purpose:** Comprehensive test generation  
**Generates:**
- `src/__tests__/<Component>.test.tsx` — Full test suite

**Key emphasis:**
- Generates **complete** tests, not skeletons
- Happy path + edge cases + error states + accessibility + integration
- All tests must pass before feature is considered done

---

## Skills (5 Total)

| Skill | Agent | Purpose |
|-------|-------|---------|
| `/scaffold-project <repo>` | Scaffolder | One-time codebase analysis and documentation |
| `/specify-feature "<request>"` | Specifier | Product specification and PRD generation |
| `/plan-issue <number>` | Planner | Technical planning and breakdown |
| `/build-issue <number>` | Builder | Feature implementation |
| `/generate-tests <file>` | Test-Generator | Comprehensive test generation |

**New skills created:**
- `scaffold-project.md`
- `specify-feature.md`
- `generate-tests.md`

**Updated skills:**
- `plan-issue.md` (now references docs/plans/<issue>.md instead of GitHub comments)
- `build-issue.md` (existing, still valid)

---

## Documentation Structure

After running the workflow, you'll have:

```
test-repo/
  docs/
    CLAUDE.md                 # Codebase docs (Scaffolder)
    architecture.md           # System architecture (Scaffolder)
    tech-debt.md              # Known issues (Scaffolder)
    PRD.md                    # Product requirements (Specifier)
    ADRs/                     # Architectural decisions (Scaffolder)
      001-*.md
      002-*.md
    spec/                     # Issue specifications (Specifier)
      1.md
      2.md
    plans/                    # Technical plans (Planner)
      1.md
      2.md
  src/
    __tests__/                # Test files (Test-Generator)
      Navigation.test.tsx
      theme.test.ts
  .github/
    workflows/
      deploy.yml
```

**Key insight:** Docs are durable, versionable, searchable. Not in chat history.

---

## Workflow Comparison: Old vs New

### Old Workflow (V1)
```
Issue → Planner (posts plan as GitHub comment) 
      → Builder (reads comment from GitHub) 
      → Auto-PR (hook creates PR) 
      → Reviewer (posts review to PR)
```

**Problems:**
- Plans lost in chat history
- Plan-Builder communication goes through GitHub
- Only three agents
- No product-level planning
- Test-generator wasn't fully integrated

### New Workflow (V2 — Your Request)
```
Codebase ─→ Scaffolder → docs/CLAUDE.md (read by all agents)
                ↓
            (one-time)
                
Feature Request ─→ Specifier → docs/PRD.md
                  ↓
            (human reviews)
                  ↓
          Planner → docs/plans/<issue>.md
                  ↓
            (human reviews)
                  ↓
          Builder → code commit + push
                  ↓
            (auto-hook creates draft PR)
                  ↓
          Test-Generator → src/__tests__/<Component>.test.tsx
                  ↓
            (human merges)
                  ↓
          Deploy (GitHub Pages auto-deploys)
```

**Improvements:**
- Five agents, each with one job
- Product planning (Specifier) separate from technical planning (Planner)
- Plans saved to durable file location (`docs/plans/`)
- Scaffolder extracts knowledge once, all agents benefit
- Full test generation with comprehensive coverage
- Clear separation: Specifier → Planner → Builder → Test-Generator
- All documentation is searchable, versionable, not ephemeral

---

## Key Distinctions Explained

### Prompts vs Skills vs Hooks

**Prompts** — One-off instructions
```
"Analyze this error for me"
"Should we add a database migration?"
```
- Typed once per use
- Ephemeral (chat-session only)
- Flexible wording
- Use for: exploration, debugging, unexpected tasks

**Skills** — Reusable commands
```
/scaffold-project test-repo
/specify-feature "Add dark mode"
/plan-issue 1
/build-issue 1
/generate-tests src/Navigation.tsx
```
- Consistent interface
- Persistent (in `.md` files)
- Shareable with team
- Use for: repeatable workflows

**Hooks** — Passive automation
```json
{
  "hooks": {
    "Stop": [{"command": "bash ./.claude/hooks/auto-pr.sh"}]
  }
}
```
- Fire automatically (no action needed)
- Examples: auto-lint, auto-PR, notifications
- Use for: silent automation, quality gates

---

## When to Use Each Agent

| Agent | When | Frequency |
|-------|------|-----------|
| **Scaffolder** | Project setup, architecture changes | Once per project (or when architecture changes) |
| **Specifier** | New feature request | Per feature |
| **Planner** | After PRD approved | Per feature |
| **Builder** | After plan approved | Per feature |
| **Test-Generator** | After code built | Per feature |

---

## For Your Team Session

**Structure your demo:**

1. **Explain the distinctions:**
   - Prompts = thoughts
   - Skills = muscle memory
   - Hooks = your robot

2. **Show the workflow:**
   - Scaffolder extracts knowledge (one-time)
   - Specifier captures product thinking
   - Planner breaks into technical tasks
   - Builder executes
   - Test-Generator verifies

3. **Walk through a real example:**
   - Create an issue for "dark mode toggle"
   - Run `/scaffold-project test-repo` (Scaffolder)
   - Run `/specify-feature "..."` (Specifier)
   - Show the PRD and spec files
   - Run `/plan-issue 1` (Planner)
   - Show the technical plan
   - Run `/build-issue 1` (Builder)
   - Show the code changes and auto-created PR
   - Run `/generate-tests src/components/Navigation.tsx` (Test-Generator)
   - Show the passing tests

4. **Emphasize key points:**
   - "Product (Specifier) separate from technical (Planner) prevents endless debates"
   - "Everything is documented durably (in docs/, git-tracked), not in chat"
   - "Each phase is independent; humans review between phases"
   - "Builder is disciplined; no improvisation"
   - "All tests must pass; we don't deploy without confidence"

---

## Files Modified/Created

### New Files
- `.claude/agents/scaffolder.md`
- `.claude/agents/specifier.md`
- `.claude/skills/scaffold-project.md`
- `.claude/skills/specify-feature.md`
- `.claude/skills/generate-tests.md`
- `PROMPTS-VS-SKILLS-VS-HOOKS.md`
- `WORKFLOW-ARCHITECTURE.md`
- `WORKFLOW-COMPLETE.md`
- `IMPLEMENTATION-SUMMARY.md` (this file)

### Files Updated
- `.claude/agents/planner.md` — Now reads PRD, saves to docs/plans/<issue>.md
- `.claude/agents/builder.md` — Now reads from docs/plans/<issue>.md, emphasizes discipline
- `.claude/agents/test-generator.md` — Emphasizes comprehensive test coverage
- `.claude/skills/plan-issue.md` — Updated to reference docs/plans/<issue>.md
- `.claude/settings.local.json` — Already has permissions for gh, npm, git commands

### Unchanged (Still Valid)
- `.claude/agents/builder.md` (updated but still works)
- `.claude/agents/reviewer.md` (not modified; still valid for PR reviews)
- `.claude/skills/build-issue.md` (unchanged)
- `.claude/skills/review-pr.md` (unchanged)

---

## Next Steps

1. **Before the demo:**
   - Read all the documentation files (especially WORKFLOW-COMPLETE.md)
   - Understand the five agents and their responsibilities
   - Practice running the workflow on a real feature

2. **During the demo:**
   - Walk through the complete workflow
   - Show the documentation generated at each step
   - Emphasize the distinctions (product → technical → implementation)

3. **After the demo:**
   - Have team try it on a real feature
   - Iterate on the workflow based on feedback
   - Add team-specific customizations to agents

---

## Summary

You now have a **sophisticated, five-stage AI-native SDLC workflow** that:
- ✅ Separates product thinking from technical thinking
- ✅ Generates durable, searchable documentation (not chat-ephemeral)
- ✅ Enables async collaboration (humans review between phases)
- ✅ Maintains discipline (Builder follows plan exactly)
- ✅ Ensures quality (comprehensive test generation)
- ✅ Scales elegantly (Scaffolder extracts knowledge once)

Ready to demo to your team!

---

**Last updated:** 2026-05-25
