---
name: scaffold-project
description: One-time project setup - analyzes codebase and generates CLAUDE.md, architecture diagrams, ADRs, and tech debt documentation
---

# Scaffold Project Skill

## Usage
```
/scaffold-project <repo-path>
```

Examples:
```
/scaffold-project test-repo
/scaffold-project /Users/aditibhatnagar/Documents/temp/rohit-ai-sdlc-session/test-repo
```

## What This Does
Invokes the **Scaffolder agent** to analyze an existing codebase and generate comprehensive documentation:

1. **Generates `docs/CLAUDE.md`** — Full codebase documentation
   - Tech stack, frameworks, versions
   - Directory structure and key files
   - Build and deployment process
   - Known gotchas and quirks
   - Open questions

2. **Generates `docs/architecture.md`** — System architecture
   - C4 diagrams or text descriptions
   - Component overview
   - Data flow
   - External integrations

3. **Generates `docs/ADRs/`** — Architectural Decision Records
   - One file per major decision
   - Format: Context → Decision → Consequences

4. **Generates `docs/tech-debt.md`** — Technical debt tracking
   - Known issues and limitations
   - Refactoring candidates
   - Performance bottlenecks
   - Testing gaps

## Why Scaffold First?

This is a **one-time investment** that powers all downstream agents:
- **Planner agent** reads `docs/CLAUDE.md` instead of exploring
- **Builder agent** reads `docs/CLAUDE.md` for context
- **Reviewer agent** uses architecture docs for context
- **Test-Generator agent** understands the system from docs

Without scaffolding, every agent wastes time re-exploring. With scaffolding, agents move fast.

## Pre-requisites
- Repository exists locally
- It's a git repo (has `.git/` folder)

## When to Use This Skill

**Use it when:**
- Setting up a new project for the workflow
- Onboarding a new team member (run `/scaffold-project` to generate docs)
- Architecture changes significantly (re-run to update docs)
- Starting an AI-native SDLC workflow for the first time

**Don't use it for:**
- Every feature (only one-time setup)
- Updating specific docs (edit `docs/CLAUDE.md` manually if small changes)

## Output

After running, you'll have:
```
docs/
  CLAUDE.md               # Full codebase documentation
  architecture.md         # System architecture
  tech-debt.md            # Known limitations
  ADRs/
    001-decision-1.md
    002-decision-2.md
    ...
```

These files are now the source of truth. Keep them updated as the codebase evolves.

## Instructions for Claude

Extract the repo path from the user's input (e.g., `/scaffold-project test-repo` → path is `test-repo`).

Invoke the `scaffolder` sub-agent with the repo path.

The scaffolder will:
1. Analyze the codebase
2. Identify tech stack, architecture, key files
3. Generate the four documentation files in `docs/`
4. Report completion

## For Team Session

**Teaching point:** "Scaffold once, reuse forever. After 30 minutes of documentation, every agent can move 10x faster because they don't re-explore."
