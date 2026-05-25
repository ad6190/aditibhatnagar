---
name: specify-feature
description: Product-level planning - transforms a feature request into a detailed PRD with acceptance criteria, user stories, and design decisions
---

# Specify Feature Skill

## Usage
```
/specify-feature "<feature-request>"
```

Examples:
```
/specify-feature "Add dark mode toggle so users can use the blog at night"

/specify-feature "Users want to search for blog posts by title or tag"

/specify-feature "Add comment notifications via email"
```

## What This Does
Invokes the **Specifier agent** to transform a plain-language feature request into a detailed **Product Requirements Document (PRD)**.

**Output:**
1. **`docs/PRD.md`** — Updated/created with new feature section
   - Problem statement (why is this needed?)
   - Acceptance criteria (checklist of what "done" means)
   - User stories (narrative format)
   - Design and architecture notes
   - Dependencies and integration points
   - Risks and unknowns

2. **`docs/spec/<issue-number>.md`** — Issue-specific detailed specification
   - All requirements for this specific issue
   - Design mockups/sketches
   - Architecture decisions
   - Implementation notes

## Why Specify Before Building?

Without a PRD, teams build the wrong thing. Specifier ensures:
- **Everyone agrees** on what "done" means (acceptance criteria)
- **User needs** are clear (not just vague ideas)
- **Design decisions** are documented (not improvised later)
- **Risks** are identified upfront (not discovered during testing)

**Key insight:** Product thinking (Specifier) comes BEFORE technical thinking (Planner) comes BEFORE implementation (Builder).

## Pre-requisites
- Codebase has been scaffolded (run `/scaffold-project` first)
- Feature request is described (can be vague; Specifier will clarify)

## When to Use This Skill

**Use it when:**
- A new feature request comes in
- You want to clarify what "done" means
- The team disagrees on requirements
- A feature is complex and needs upfront thinking

**Don't use it for:**
- Bug fixes (those can skip to planning/building)
- Simple one-line tweaks
- Refactoring tasks

## Workflow After Specifying

```
1. /specify-feature "..." → Specifier creates PRD and spec
2. Team reviews PRD on GitHub/locally
3. Team approves or requests changes
4. /plan-issue <number> → Planner breaks into technical tasks
5. Team reviews plan
6. /build-issue <number> → Builder implements
```

## Output Example

For "Add dark mode toggle", Specifier generates:

**`docs/PRD.md`:**
```
## Feature: Dark Mode Toggle

### Problem Statement
Users report eye strain when using the blog at night...

### Acceptance Criteria
- [ ] Toggle button in navigation
- [ ] Preference persists
- [ ] Comments adapt to theme
- ...

### User Stories
As a user browsing at night, I want dark mode...
```

**`docs/spec/1.md`:**
```
# Spec — Issue #1: Dark Mode Toggle

## Requirements (from PRD)
...

## Design
Toggle in top-right, sun/moon icon...

## Architecture
React Context for state, localStorage for persistence...
```

## Instructions for Claude

Extract the feature request from the user's input (e.g., `/specify-feature "Add dark mode"` → request is "Add dark mode").

Invoke the `specifier` sub-agent with the feature request.

The specifier will:
1. Understand the user need (why this feature?)
2. Define acceptance criteria (how do we know it's done?)
3. Create user stories (narrative format)
4. Sketch the design
5. Identify dependencies and risks
6. Generate `docs/PRD.md` and `docs/spec/<number>.md`

## For Team Session

**Teaching point:** "We separate product planning from technical planning. Product asks 'what does the user need?' Technical asks 'how do we build it?' This prevents debates during coding."
