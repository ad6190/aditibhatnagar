# AI-Native SDLC Workflow Architecture

This document describes the complete, multi-agent SDLC workflow with clear separation between product planning, technical planning, implementation, and testing.

---

## The Five-Stage Workflow

```
Codebase → Scaffolder Agent → docs/CLAUDE.md, docs/ADRs/, docs/architecture.md
     ↑
     │ (one-time setup)
     │

Feature Request → Specifier Agent → docs/PRD.md, docs/spec/<issue>.md
     ↑
     │ (human reviews PRD)
     │

         → Planner Agent → docs/plans/<issue>.md (technical breakdown)
     ↑
     │ (human reviews plan)
     │

         → Builder Agent → commits code, pushes
     ↑
     │ (auto-hook creates draft PR)
     │

         → Test-Generator Agent → src/__tests__/<component>.test.tsx
     ↑
     │ (human merges)
     │

         → Live (GitHub Pages auto-deploys)
```

---

## Agent Responsibilities

### 1. Scaffolder Agent — One-Time Project Setup
**Invoked:** First time you want to document a project, or when architecture changes
**Triggered by:** Manual prompt or `/scaffold-project <repo-name>`

**Responsibilities:**
- Read the existing codebase (directory structure, key files)
- Understand the tech stack, frameworks, libraries
- Identify modules, components, services
- Extract architectural patterns
- Identify tech debt, gotchas, known issues

**Generates:**
- `docs/CLAUDE.md` — Full codebase documentation (stack, structure, workflows)
- `docs/architecture.md` — System architecture with C4 diagrams
- `docs/ADRs/` — Architectural Decision Records for each major component
- `docs/tech-debt.md` — Known limitations, performance issues, refactoring candidates

**Output format:** Markdown files in `docs/` folder (persistent, versionable)

**Key principle:** One-time investment. Once these files exist, all downstream agents read them instead of re-exploring.

---

### 2. Specifier Agent — Product-Level Planning
**Invoked:** When a feature request comes in
**Triggered by:** Manual prompt or `/specify-feature "<description>"`

**Responsibilities:**
- Take a plain-language feature request or user story
- Understand the user need (not the technical solution)
- Define what success looks like (acceptance criteria)
- Sketch the architecture/design (how it fits into the system)
- Identify dependencies and risks
- Create user stories or use cases
- Generate architectural diagrams if complex

**Generates:**
- `docs/PRD.md` — Product Requirements Document (one per project, updated per feature)
  ```markdown
  # Product Requirement Document

  ## Feature: Dark Mode Toggle

  ### User Need
  Users want to switch between light and dark themes...

  ### Acceptance Criteria
  - [ ] Dark mode toggle in navigation
  - [ ] Preference persists across sessions
  - [ ] Giscus comments adapt to theme

  ### User Stories
  - As a user, I want to toggle dark mode so I can use the blog at night
  - As a user, I want my preference saved so I don't re-toggle

  ### Design Notes
  - Toggle button in top-right of nav
  - Sun/moon icon to indicate current theme
  - Uses Tailwind dark: utility classes

  ### Dependencies
  - React Context for state management
  - Tailwind CSS dark mode enabled
  - localStorage API

  ### Risks
  - Giscus iframe may flicker on theme change
  - System preference detection (fallback)
  ```

- `docs/spec/<issue-number>.md` — Detailed specification per issue
  ```markdown
  # Spec: Issue #1 — Add Dark Mode

  (Includes architecture decisions, design sketches, integration points)
  ```

**Output format:** Markdown files in `docs/` folder

**Key principle:** Specifier thinks product-first, not implementation-first. The PRD stays stable even if technical approach changes.

---

### 3. Planner Agent — Technical Breakdown
**Invoked:** After PRD is approved
**Triggered by:** `/plan-issue <issue-number>`

**Responsibilities:**
- Read the PRD/spec from Specifier
- Analyze the codebase (via `docs/CLAUDE.md`, `docs/architecture.md`)
- Break the feature into technical tasks
- Identify which files need changes
- Plan new dependencies, migrations, configs
- Estimate effort (rough)
- Flag technical risks or unknowns

**Generates:**
- `docs/plans/<issue-number>.md` — Technical implementation plan
  ```markdown
  # Technical Plan — Issue #1: Dark Mode Toggle

  ### Summary
  Add a ThemeProvider context for dark mode state, wire it into the app, 
  add toggle UI to Navigation, and persist to localStorage.

  ### Files to Create
  - `src/lib/theme.ts` (ThemeProvider context + hooks)
  - `src/__tests__/theme.test.ts` (context tests)

  ### Files to Change
  - `src/App.tsx` (wrap with ThemeProvider)
  - `src/components/Navigation.tsx` (add toggle button)
  - `src/components/CommentSection.tsx` (watch theme context)
  - `tailwind.config.ts` (ensure dark mode enabled)

  ### Dependencies
  - No new npm packages (Tailwind dark: is built-in)

  ### Architecture
  - Theme state lives in React Context (not Redux)
  - localStorage for persistence
  - System preference as fallback

  ### Implementation Approach
  1. Create theme context in src/lib/theme.ts
  2. Add provider wrapper in App.tsx
  3. Wire toggle in Navigation.tsx (click handler)
  4. Update CommentSection to re-render on theme change
  5. Test with localStorage, system preference

  ### Edge Cases
  - User has localStorage disabled (incognito mode)
  - Initial render: theme not yet loaded (prevent flash)
  - Giscus iframe: may need forced re-render

  ### Acceptance Criteria (from PRD)
  - [ ] Toggle button renders in Navigation
  - [ ] Clicking toggle switches theme
  - [ ] Preference persists after reload
  - [ ] Giscus theme updates
  - [ ] No console errors
  - [ ] npm run lint passes
  - [ ] npm run build succeeds

  ### Out of Scope
  - Theming entire app (just light/dark toggle, not color scheme customization)
  - Animation/transitions on theme change
  - Server-side rendering
  ```

**Output format:** Markdown file in `docs/plans/`

**Key principle:** Planner breaks the PRD into actionable technical tasks. Builder will follow this plan exactly.

---

### 4. Builder Agent — Implementation
**Invoked:** After plan is approved
**Triggered by:** `/build-issue <issue-number>`

**Responsibilities:**
- Read the technical plan from Planner
- Implement exactly what the plan specifies (no improvisation)
- Create new files as specified
- Edit existing files as specified
- Run lint and build checks
- Commit with a message referencing the issue
- Push to main

**Generates:**
- Code changes (commits to main)
- Auto-trigger: Draft PR created by hook

**Key principle:** Builder is disciplined. Follows the plan exactly. No scope creep, no refactoring beyond the plan.

---

### 5. Test-Generator Agent — Test Coverage
**Invoked:** After build is complete (optional, can be part of workflow or manual)
**Triggered by:** `/generate-tests <file-path>` or manual prompt

**Responsibilities:**
- Read the implemented feature (files from the build)
- Read the technical plan (acceptance criteria)
- Generate comprehensive tests
  - Happy path (feature works as specified)
  - Edge cases (null, undefined, empty, boundary conditions)
  - Error states (what if X fails?)
  - Accessibility (ARIA, keyboard nav, focus management)
- Scaffold test runner if not present (Vitest)
- Write test files to `src/__tests__/<ComponentName>.test.tsx`
- Run tests and fix failures

**Generates:**
- Test files in `src/__tests__/` with full coverage

**Output format:** TypeScript/JavaScript test files

**Key principle:** Tests are generated after implementation, not before. Focuses on acceptance criteria from the plan.

---

## When to Use Skills vs Prompts vs Hooks

### Skills (Reusable Commands)

Use skills for workflows you'll repeat every feature cycle:

```
/scaffold-project <repo>          # One-time setup
/specify-feature "<description>"  # Whenever you have a feature request
/plan-issue <number>              # After PRD is approved
/build-issue <number>             # Ready to build
/generate-tests <file>            # After code is built
/review-pr <number>               # Code needs review
```

**Why skills?**
- Consistent interface (same command always works the same way)
- Team uses the same process (no "how did we do this last time?")
- Documented (`.claude/skills/*.md`)
- Reusable across projects

### Prompts (One-Off Instructions)

Use prompts for exploratory or unexpected tasks:

```
"Should we add database migrations for the dark mode feature?"
"The lint check failed; what's wrong?"
"Is the test coverage sufficient?"
"How would we handle theme changes in Service Workers?"
```

**Why prompts?**
- One-off questions
- Debugging or exploration
- Novel situations not covered by standard skills
- Flexible wording

### Hooks (Passive Automation)

Use hooks for things that should happen automatically:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*Edit*",
        "command": "bash .claude/hooks/auto-lint.sh"
      }
    ],
    "Stop": [
      {
        "command": "bash .claude/hooks/auto-pr.sh"
      }
    ]
  }
}
```

**Why hooks?**
- Automatic linting after edits
- Auto-create draft PR when builder commits
- Notifications when tasks complete
- Quality gates that run without asking

---

## Typical Feature Cycle

### Day 1: Specify the Feature

**User:** "We need dark mode support"

```bash
/specify-feature "Add dark mode toggle so users can use the blog at night"
```

**Specifier generates:**
- `docs/PRD.md` (or updates existing one)
- `docs/spec/1.md` (dark mode specification)

Output includes:
- User stories
- Acceptance criteria
- Design sketches
- Architectural decisions

**Team reviews** on GitHub (discuss the PRD, approve or request changes)

---

### Day 2: Plan the Implementation

```bash
/plan-issue 1
```

**Planner generates:**
- `docs/plans/1.md` (technical breakdown)

Output includes:
- Files to create/change
- Architecture decisions
- Edge cases
- Effort estimate
- Acceptance criteria checklist

**Team reviews** (check the plan makes sense, approve or request changes)

---

### Day 2 (continued): Build

```bash
/build-issue 1
```

**Builder:**
- Implements the plan exactly
- Runs lint and build
- Commits with "Closes #1"
- Pushes to main

**Auto-action (hook):**
- Draft PR is created automatically

**Team reviews** the PR on GitHub

---

### Day 3: Generate Tests

```bash
/generate-tests src/components/Navigation.tsx
```

**Test-Generator:**
- Generates comprehensive tests
- Happy path, edge cases, accessibility
- Writes to `src/__tests__/Navigation.test.tsx`
- Runs tests and fixes failures

**Output:** Passing test suite for the feature

---

### Day 3 (continued): Deploy

- Merge PR to main (all checks passing)
- GitHub Actions auto-deploys to GitHub Pages
- Feature is live

---

## File Structure After Workflow

```
test-repo/
  docs/
    CLAUDE.md                 # Full codebase documentation
    architecture.md           # System architecture
    PRD.md                    # Product requirements (one per project)
    tech-debt.md              # Known limitations
    spec/
      1.md                    # Specification for issue #1
      2.md                    # Specification for issue #2
    plans/
      1.md                    # Technical plan for issue #1
      2.md                    # Technical plan for issue #2
    ADRs/
      001-context-vs-redux.md  # Architectural decisions
      002-tailwind-dark-mode.md
  src/
    components/
      Navigation.tsx
    lib/
      theme.ts                # New file from build
    __tests__/
      Navigation.test.tsx     # New test file
  .github/
    workflows/
      deploy.yml
```

---

## For Your Team Session

**Teaching narrative:**

1. **Scaffolder** — "This runs once. It extracts all the knowledge about your codebase into documentation."

2. **Specifier** — "This is product thinking. We ask: what does the user need? What are the acceptance criteria? What does success look like?"

3. **Planner** — "This is technical thinking. We ask: how do we build this? What files change? What are the edge cases?"

4. **Builder** — "This is execution. Just follow the plan. No improvisation."

5. **Test-Generator** — "This is quality. We generate tests for everything we built."

6. **Skills** — "One command per step. Repeatable, documented, shareable."

7. **Hooks** — "This is the robot. Set it up once, it does things without asking."

---

**Last updated:** 2026-05-25
