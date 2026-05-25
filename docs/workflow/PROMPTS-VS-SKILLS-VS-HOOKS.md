# Prompts vs Skills vs Hooks — Understanding the Distinctions

This guide clarifies when to use prompts, skills, and hooks in Claude Code workflows.

---

## Quick Comparison

| Aspect | Prompt | Skill | Hook |
|--------|--------|-------|------|
| **Definition** | One-off instruction in chat | Reusable command with `/name` | Automation trigger on events |
| **Invocation** | Type full text each time | `/skill-name <args>` | Automatic (no action needed) |
| **Persistence** | Chat-session only | Stored in `.claude/skills/*.md` | Configured in `settings.json` |
| **Scope** | Single conversation | Across sessions, shareable | Global (project-level) |
| **Use case** | Exploration, debugging | Repeatable workflows | Passive automation |
| **Example** | "Analyze this error" | `/plan-issue 1` | Auto-create PR on commit |

---

## PROMPTS — Conversational Instructions

### What is a Prompt?
A prompt is a one-off instruction you give Claude in a conversation. It's ephemeral — it lives in chat history and isn't reused.

### Examples
```
"Use the Scaffolder agent to analyze the test-repo codebase and generate CLAUDE.md"

"Generate a test file for Navigation.tsx that covers dark mode toggling"

"Review this code and suggest improvements"

"What's the difference between React Context and Redux?"
```

### Characteristics
- **Typed once per use** — You re-type it (or copy-paste) each time you need it
- **Flexible wording** — "analyze the code", "study the codebase", "examine the files" all work
- **Conversation-bound** — Only exists in this chat; not shared with team
- **No structure** — Can be as long or short as you want
- **Hard to reuse** — Requires copying chat history or re-typing

### When to Use Prompts
✅ **Exploratory work** — "What would happen if we refactored this?"
✅ **One-off tasks** — "Fix this bug", "Explain this error"
✅ **Debugging** — "Why is this test failing?"
✅ **Quick questions** — "Do we need a database migration?"

### Example Prompt
```
Analyze the Navigation.tsx component and identify all the places where theme context is used. 
Then suggest how to optimize theme-switching performance.
```

---

## SKILLS — Reusable Command Shortcuts

### What is a Skill?
A skill is a reusable, named interface to Claude. It's defined in a `.md` file and invoked with a `/command` syntax. Think of it like a shell command or CLI tool.

### Example
```
/plan-issue 42
/build-issue 42
/review-pr 5
```

### Characteristics
- **Consistent interface** — Same command always works the same way
- **Reusable** — You (and your team) use it over and over
- **Documented** — Lives in `.claude/skills/<name>.md`
- **Shareable** — Stored in git; team can use the same skill
- **Structured input** — Takes arguments in a predictable way
- **Persistent** — Doesn't disappear after one use

### File Structure
```
.claude/skills/
  plan-issue.md         ← defined once, used many times
  build-issue.md
  review-pr.md
  generate-tests.md
```

Each skill file contains:
```yaml
---
name: skill-name
description: What this skill does
---

# Skill Name

## Usage
/skill-name <required-arg> [optional-arg]

## What This Does
...detailed explanation...

## Instructions for Claude
(How Claude should execute this skill)
```

### When to Use Skills
✅ **Repeatable workflows** — Things you do regularly
✅ **Team-shared tasks** — "Run `/plan-issue` to analyze any feature"
✅ **Complex multi-step tasks** — "One command triggers plan → build → test"
✅ **Standardized processes** — "Every feature goes through `/plan-issue` first"

### Example Skill Definition
```markdown
---
name: plan-issue
description: Plan a GitHub issue using the Planner agent
---

# Plan Issue

## Usage
/plan-issue <issue-number>

Example: /plan-issue 42

## What This Does
Invokes the Planner agent to:
1. Read the GitHub issue
2. Analyze the codebase
3. Generate a technical plan
4. Save plan to docs/plans/<issue-number>.md

## Instructions for Claude
Extract the issue number from the user input (e.g., /plan-issue 42 → 42).
Invoke the planner sub-agent with that issue number.
```

### Analogy
- **Prompt** = Typing `find . -name "*.tsx" -exec grep -l "useState" {} \;` every time
- **Skill** = Creating a command `find-stateful-components` that does that automatically

---

## HOOKS — Passive Automation Triggers

### What is a Hook?
A hook is an automated action that runs without you asking. It's triggered by events in the Claude Code lifecycle.

### Configuration
Hooks are defined in `.claude/settings.local.json`:
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "command": "bash ./.claude/hooks/auto-pr.sh",
        "timeout": 10000
      }
    ]
  }
}
```

### Hook Events

| Event | Triggers | Use Case |
|-------|----------|----------|
| `UserPromptSubmit` | When user submits a prompt | Log prompts, check for risky input |
| `PreToolUse` | Before a tool is used | Validate tool safety, check permissions |
| `PostToolUse` | After a tool is used | Auto-format files, run linters, post status |
| `Stop` | Agent/turn completes | Auto-create PR, send Slack notification, cleanup |
| `SessionEnd` | Session closes | Archive artifacts, cleanup temp files |

### Example Hooks

**Auto-Create PR After Build:**
```bash
#!/bin/bash
# .claude/hooks/auto-pr.sh
LAST_MSG=$(git log -1 --pretty=%B)
if echo "$LAST_MSG" | grep -q "Closes #"; then
  gh pr create --draft --title "Auto-created"
fi
```

**Lint Files After Edit:**
```bash
#!/bin/bash
# .claude/hooks/auto-lint.sh
npm run lint -- --fix
```

**Slack Notification On Stop:**
```bash
#!/bin/bash
# Send notification to Slack when agent finishes
curl -X POST $SLACK_WEBHOOK -d '{"text":"Agent finished task"}'
```

### Characteristics
- **Automatic** — Fire without user action (no `/` command needed)
- **Event-driven** — Triggered by specific lifecycle events
- **Configured globally** — Set once, runs for all sessions
- **Powerful but careful** — Can do things without asking (be cautious!)
- **Script-based** — Hooks run shell scripts (bash), not prompts

### When to Use Hooks
✅ **Safe automation** — Things that should run without asking (e.g., auto-linting)
✅ **Notifications** — Alert the team when something finishes
✅ **Cleanup** — Remove temp files after builds
✅ **Quality gates** — Auto-run tests after commits
⚠️ **Be careful** — Avoid surprising automation (e.g., don't auto-delete files!)

### Hook Safety Guidelines
- **Idempotent** — Should be safe to run multiple times
- **No surprises** — Don't auto-approve, auto-merge, or auto-delete
- **Quiet failures** — If a hook fails, log it but don't break the workflow
- **Fast** — Keep hook timeouts short (5-10 seconds)

---

## Decision Tree: When to Use Each

```
Question: Is this a one-off task?
├─ YES → Use PROMPT
│        "Analyze this error for me"
│
└─ NO → Will I (or my team) do this repeatedly?
   ├─ YES, every session → Use SKILL
   │                        /plan-issue 42
   │
   └─ NO → Should it run automatically?
      ├─ YES → Use HOOK
      │        Hook fires on Stop event
      │
      └─ NO → Use PROMPT
             "Let me explore this idea..."
```

---

## Real-World Examples

### Scenario 1: "Add a feature to the blog"

**Workflow:**

1. **Prompt** — Explore the issue:
   ```
   "What does the feature request in issue #5 actually need?"
   ```
   (One-off exploration)

2. **Skill** — Plan the feature:
   ```
   /plan-issue 5
   ```
   (Repeatable: every feature gets planned)

3. **Human review** — Look at plan on GitHub

4. **Skill** — Build the feature:
   ```
   /build-issue 5
   ```
   (Repeatable: every feature gets built)

5. **Hook** — Auto-creates PR (no action needed)
   (Passive: happens automatically)

6. **Skill** — Review the code:
   ```
   /review-pr 5
   ```
   (Repeatable: every PR gets reviewed)

---

### Scenario 2: "I want to understand the architecture"

**Workflow:**

1. **Prompt** — Initial exploration:
   ```
   "What's the architecture of the blog project?"
   ```

2. **Skill** — Generate full documentation:
   ```
   /scaffold-project test-repo
   ```
   (Repeatable: scaffold any new project)

3. **Output:** Generates CLAUDE.md, architecture diagrams, ADRs in `docs/`

---

### Scenario 3: "Set up team automation"

**Scenario:** You want tests to auto-run and linters to auto-fix on every file change

**Solution:** Use HOOKS (not skills or prompts)

```json
{
  "hooks": {
    "PostToolUse": [
      {"command": "bash ./.claude/hooks/auto-lint.sh"},
      {"command": "bash ./.claude/hooks/run-tests.sh"}
    ]
  }
}
```

Now, every time the agent uses a tool (e.g., Edit), the hooks auto-run lint and tests. No `/command` needed.

---

## Summary

| To achieve... | Use... | Example |
|---|---|---|
| One-off exploration | **Prompt** | "What's in this file?" |
| Repeatable feature workflow | **Skill** | `/plan-issue 5` |
| Automatic quality gates | **Hook** | Auto-lint on file save |
| Debug something | **Prompt** | "Why is this failing?" |
| Standardized team process | **Skill** | `/build-issue 5` |
| Passive notifications | **Hook** | Slack on PR created |

---

## For Your Team Session

**Teaching points:**

1. **Prompts are thoughts** — Use them to think through problems
2. **Skills are muscle memory** — Use them for workflows you repeat
3. **Hooks are your robot** — Set them up once to automate forever
4. **Together they scale** — Prompts for exploration, skills for repeatability, hooks for automation

Show examples:
- Prompt: "Analyze this error"
- Skill: `/plan-issue 1`
- Hook: Auto-PR created (no action)

Then ask: "Which one should we use for X?"

---

**Last updated:** 2026-05-25
