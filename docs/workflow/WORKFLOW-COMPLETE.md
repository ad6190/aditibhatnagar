# Complete AI-Native SDLC Workflow

This document shows the full, five-stage workflow with product-level and technical-level planning.

---

## The Five-Stage Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ONE-TIME SETUP (Run Once)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Step 1: /scaffold-project test-repo                                   │
│  ├─ Analyzes codebase                                                  │
│  ├─ Generates docs/CLAUDE.md (codebase documentation)                 │
│  ├─ Generates docs/architecture.md (system design)                    │
│  ├─ Generates docs/ADRs/ (architectural decisions)                    │
│  └─ Generates docs/tech-debt.md (known issues)                        │
│                                                                         │
│  Agent: Scaffolder                                                      │
│  Tools: Read, Write, Bash, WebFetch                                    │
│  Output: Durable documentation in docs/ folder                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                  FEATURE DEVELOPMENT CYCLE (Per Feature)                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Step 2: /specify-feature "User need..."                              │
│  ├─ Transforms feature request into PRD                               │
│  ├─ Generates docs/PRD.md (product requirements)                      │
│  ├─ Generates docs/spec/<issue>.md (issue-specific spec)              │
│  ├─ Includes: problem statement, acceptance criteria, user stories,  │
│  │  design notes, dependencies, risks                                 │
│  └─ Team reviews and approves PRD                                      │
│                                                                         │
│  Agent: Specifier                                                       │
│  Tools: Read, Write, Bash, WebFetch                                    │
│  Output: docs/PRD.md, docs/spec/<issue>.md                            │
│                                                                         │
│  ↓ TEAM REVIEWS PRD ↓                                                  │
│                                                                         │
│  Step 3: /plan-issue <number>                                          │
│  ├─ Reads PRD from Specifier                                          │
│  ├─ Reads codebase context (docs/CLAUDE.md from Scaffolder)          │
│  ├─ Breaks feature into technical tasks                               │
│  ├─ Identifies files to create/change                                 │
│  ├─ Plans architecture and edge cases                                 │
│  ├─ Generates docs/plans/<issue>.md (technical plan)                  │
│  └─ Team reviews and approves plan                                     │
│                                                                         │
│  Agent: Planner                                                         │
│  Tools: Read, Write, Bash, WebFetch                                    │
│  Output: docs/plans/<issue>.md                                         │
│                                                                         │
│  ↓ TEAM REVIEWS PLAN ↓                                                 │
│                                                                         │
│  Step 4: /build-issue <number>                                         │
│  ├─ Reads technical plan (docs/plans/<issue>.md)                      │
│  ├─ Implements feature exactly per plan (no improvisation)            │
│  ├─ Runs npm run lint → fixes errors                                  │
│  ├─ Runs npm run build → confirms success                             │
│  ├─ Commits: git commit -m "feat: ...\n\nCloses #<number>"           │
│  ├─ Pushes: git push origin main                                      │
│  └─ Auto-hook creates draft PR (if configured)                        │
│                                                                         │
│  Agent: Builder                                                         │
│  Tools: Read, Edit, Write, Bash                                       │
│  Output: Code committed and pushed                                     │
│                                                                         │
│  ↓ AUTO-PR HOOK FIRES ↓                                                │
│                                                                         │
│  Step 5: /generate-tests <file>                                        │
│  ├─ Reads implemented feature                                          │
│  ├─ Scaffolds Vitest if needed (one-time)                            │
│  ├─ Generates comprehensive tests                                      │
│  │  ├─ Happy path (feature works)                                     │
│  │  ├─ Edge cases (null, undefined, boundaries)                       │
│  │  ├─ Error states (what if X fails?)                               │
│  │  ├─ Accessibility (ARIA, keyboard nav)                            │
│  │  └─ Integration (interaction with system)                          │
│  ├─ Writes src/__tests__/<Component>.test.tsx                         │
│  ├─ Runs tests → fixes failures → all pass                           │
│  └─ Reports coverage                                                   │
│                                                                         │
│  Agent: Test-Generator                                                  │
│  Tools: Read, Write, Edit, Bash                                       │
│  Output: Passing test suite in src/__tests__/                         │
│                                                                         │
│  ↓ MERGE TO MAIN ↓                                                     │
│  (All checks passing, tests green)                                     │
│                                                                         │
│  ✅ DEPLOY (GitHub Pages auto-deploys)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The Five Agents

### 1. Scaffolder Agent
**When:** One-time setup (run once per project, or when architecture changes)
**Input:** Repository path  
**Output:** `docs/CLAUDE.md`, `docs/architecture.md`, `docs/ADRs/`, `docs/tech-debt.md`

**What it does:**
- Analyzes codebase
- Extracts architecture, tech stack, key files
- Generates durable documentation
- **Enables:** All downstream agents read docs instead of re-exploring

**Invocation:**
```
/scaffold-project test-repo
```

---

### 2. Specifier Agent
**When:** New feature request arrives  
**Input:** Plain-language feature description  
**Output:** `docs/PRD.md`, `docs/spec/<issue>.md`

**What it does:**
- Thinks product-first: "What does the user need?"
- Defines acceptance criteria (how do we know it's done?)
- Creates user stories (narrative format)
- Sketches design and architecture
- Identifies dependencies and risks

**Invocation:**
```
/specify-feature "Add dark mode toggle so users can use the blog at night"
```

---

### 3. Planner Agent
**When:** PRD is approved, ready for technical planning  
**Input:** Issue number (reads PRD + codebase context)  
**Output:** `docs/plans/<issue>.md`

**What it does:**
- Thinks technical: "How do we build this?"
- Reads PRD from Specifier
- Reads codebase context (docs/CLAUDE.md from Scaffolder)
- Breaks feature into technical tasks
- Plans architecture, files to change, edge cases
- Creates detailed plan for Builder to follow

**Invocation:**
```
/plan-issue 1
```

---

### 4. Builder Agent
**When:** Technical plan is approved, ready to code  
**Input:** Issue number (reads technical plan)  
**Output:** Code committed and pushed to main

**What it does:**
- Follows the technical plan exactly (no improvisation)
- Creates/edits files as specified
- Runs lint and build checks
- Commits with message referencing issue
- Pushes to main
- Auto-hook creates draft PR

**Invocation:**
```
/build-issue 1
```

---

### 5. Test-Generator Agent
**When:** Feature is built, ready for testing  
**Input:** File path to test (or feature description)  
**Output:** `src/__tests__/<Component>.test.tsx` (passing tests)

**What it does:**
- Scaffolds Vitest if needed
- Generates comprehensive tests
  - Happy path
  - Edge cases
  - Error states
  - Accessibility
  - Integration
- Runs tests and fixes failures
- All tests must pass

**Invocation:**
```
/generate-tests src/components/Navigation.tsx
```

---

## The Five Skills

| Skill | Agent | When to Use | Output |
|-------|-------|-----------|--------|
| `/scaffold-project <repo>` | Scaffolder | One-time setup | `docs/CLAUDE.md`, architecture, ADRs, tech debt |
| `/specify-feature "..."` | Specifier | New feature request | `docs/PRD.md`, `docs/spec/<issue>.md` |
| `/plan-issue <number>` | Planner | After PRD approved | `docs/plans/<issue>.md` |
| `/build-issue <number>` | Builder | After plan approved | Code committed, draft PR created |
| `/generate-tests <file>` | Test-Generator | After build complete | `src/__tests__/<Component>.test.tsx` |

---

## Documentation Structure

After running through the workflow, your `docs/` folder looks like:

```
docs/
  CLAUDE.md                     # Codebase documentation (from Scaffolder)
  architecture.md               # System architecture (from Scaffolder)
  tech-debt.md                  # Known issues (from Scaffolder)
  PRD.md                        # Product requirements (from Specifier)
  ADRs/                         # Architectural decisions (from Scaffolder)
    001-context-vs-redux.md
    002-tailwind-dark-mode.md
  spec/                         # Issue-specific specifications (from Specifier)
    1.md                        # Issue #1 spec
    2.md                        # Issue #2 spec
  plans/                        # Technical implementation plans (from Planner)
    1.md                        # Issue #1 technical plan
    2.md                        # Issue #2 technical plan
```

**These files are the source of truth.** They are versionable, searchable, and kept up-to-date as the project evolves.

---

## Example: "Add Dark Mode Toggle"

### Step 1: Scaffold (One-Time Setup)
```bash
/scaffold-project test-repo
```

**Output:**
- `docs/CLAUDE.md` — Blog uses React 19, Vite, Tailwind, Giscus
- `docs/architecture.md` — React SPA, Tailwind utilities, comments via Giscus
- `docs/ADRs/001-tailwind.md` — Decision to use Tailwind (vs styled-components)
- `docs/tech-debt.md` — No tests yet, visitor counter removed

---

### Step 2: Specify Feature
```bash
/specify-feature "Users want to switch between light and dark themes for night-time use"
```

**Output:**
- `docs/PRD.md` — Dark Mode Toggle feature section with:
  ```
  ## Feature: Dark Mode Toggle
  
  ### Problem Statement
  Users report eye strain when using the blog at night...
  
  ### Acceptance Criteria
  - [ ] Toggle button in navigation
  - [ ] Clicking toggle switches theme
  - [ ] Preference persists after reload
  - [ ] Giscus comments adapt to theme
  - [ ] No page load flash
  
  ### User Stories
  As a user browsing at night, I want dark mode...
  ```

- `docs/spec/1.md` — Issue-specific specification with design and architecture

**Team reviews PRD on GitHub**

---

### Step 3: Plan Feature
```bash
/plan-issue 1
```

**Output:**
- `docs/plans/1.md` — Technical plan with:
  ```
  # Technical Plan — Issue #1: Dark Mode Toggle
  
  ## Files to Create
  - src/lib/theme.ts (ThemeProvider context)
  
  ## Files to Change
  - src/App.tsx (wrap with provider)
  - src/components/Navigation.tsx (add toggle button)
  - src/components/CommentSection.tsx (watch theme)
  
  ## Architecture
  React Context for state, localStorage for persistence,
  Tailwind dark: classes for styling
  
  ## Acceptance Criteria
  - [ ] Toggle button visible
  - [ ] Theme persists
  - [ ] Giscus updates
  - [ ] Lint passes
  - [ ] Build succeeds
  ```

**Team reviews plan**

---

### Step 4: Build Feature
```bash
/build-issue 1
```

**Output:**
- `src/lib/theme.ts` created (ThemeProvider context)
- `src/App.tsx` edited (wrapped with provider)
- `src/components/Navigation.tsx` edited (toggle button)
- `src/components/CommentSection.tsx` edited (theme watching)
- Commit: `feat: Add dark mode toggle\n\nCloses #1`
- Draft PR auto-created by hook

**Team reviews PR on GitHub**

---

### Step 5: Generate Tests
```bash
/generate-tests src/components/Navigation.tsx
```

**Output:**
- `src/__tests__/Navigation.test.tsx` with comprehensive tests:
  ```typescript
  describe('Navigation', () => {
    describe('Happy path', () => {
      it('renders toggle button', () => { ... });
      it('clicking toggles theme', () => { ... });
    });
    describe('Edge cases', () => {
      it('handles localStorage disabled', () => { ... });
      it('loads system preference', () => { ... });
    });
    describe('Accessibility', () => {
      it('toggle is keyboard accessible', () => { ... });
    });
  });
  ```
- All tests passing

**Merge PR to main** → GitHub Pages auto-deploys → Feature is live

---

## Why This Workflow Works

1. **Separation of concerns**
   - Scaffolder: Extract and document once
   - Specifier: Product thinking (what and why)
   - Planner: Technical thinking (how)
   - Builder: Execution (no thinking, just follow plan)
   - Test-Generator: Verification (does it work?)

2. **Durable documentation**
   - Everything lives in `docs/` (git-tracked, versionable, searchable)
   - Not in chat history (which disappears)
   - Source of truth for team

3. **Async collaboration**
   - Each phase is independent
   - Humans review between phases (no back-and-forth with Claude)
   - Multiple people can work on different issues in parallel

4. **Scalability**
   - Scaffolder runs once; all agents benefit
   - Same pattern works for any feature
   - Team can add more agents for specialized tasks

5. **Quality**
   - Plan is explicit (not implicit)
   - Builder can't improvise (follows plan exactly)
   - Tests verify acceptance criteria
   - All checks (lint, build, tests) must pass

---

## For Your Team Session

**Show this flow:**
1. Scaffolder extracts knowledge → team reads docs, not code
2. Specifier captures product thinking → team agrees on acceptance criteria
3. Planner breaks into technical tasks → team agrees on approach
4. Builder executes → no surprises, just follows plan
5. Test-Generator verifies → confidence that feature works

**Teaching narrative:**
- "We separate product from technical planning. Product asks 'what' and 'why'. Technical asks 'how'."
- "Everything is documented durably. No relying on chat history."
- "Each phase is independent. You review between phases; Claude doesn't ask back-and-forth questions."
- "Builder is disciplined. No improvisation. Follow the plan exactly."
- "Tests verify we built what we said we'd build."

---

**Last updated:** 2026-05-25
