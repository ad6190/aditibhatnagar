# Slack Integration Guide

The Orchestrator can be triggered from Slack using slash commands and provides real-time status updates.

---

## Setup

### 1. Create Slack App

In Slack workspace settings:
1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. Name: "Claude Code AI"
4. Choose workspace

### 2. Configure Slash Command

In your Slack app settings:

**Slash Commands → Create New Command**
- Command: `/start-feature`
- Request URL: [Your Claude Code webhook endpoint]
- Short Description: "Start an AI-assisted feature development workflow"
- Usage Hint: `[feature description]`

### 3. Configure Incoming Webhook (for Claude to post to Slack)

**Incoming Webhooks → Add New Webhook to Workspace**
- Select channel: #ai-features (or create one)
- Copy webhook URL

### 4. Add Permissions

In **OAuth & Permissions**, add scopes:
- `chat:write` (post messages)
- `commands` (slash commands)
- `users:read` (identify users)

Install app to workspace.

---

## How It Works

### User Triggers from Slack

```
@User: /start-feature Add dark mode toggle so users can use the blog at night

[Slack receives command, sends to Orchestrator webhook]
```

### Orchestrator Processes

```
Orchestrator receives: {
  user_id: "U1234567",
  user_name: "john.doe",
  text: "Add dark mode toggle...",
  channel_id: "C5678901"
}

Orchestrator:
1. Creates GitHub issue
2. Starts workflow
3. Posts status updates to Slack
```

### Status Updates in Slack

```
⏳ Starting feature workflow...
Issue #42 created

[workflow progresses]

✅ PRD created
✅ Plan created
✅ Building...
✅ Tests passing (12/12 Playwright tests)
✅ Code review approved

✅ Feature ready!
PR #10: https://github.com/.../pull/10

Next: Review and merge
```

---

## Slack Integration Points

### Trigger: Slash Command
```
/start-feature "Feature description"
```

### Status Channel Posts
Orchestrator posts to #ai-features:
```
⏳ Starting workflow for issue #42
[10:00] PRD created ✅
[10:05] Plan created ✅
[10:10] Building ✅
[10:15] Tests: 12/12 passing ✅
[10:20] Review approved ✅

PR ready: https://github.com/.../pull/10
```

### Direct Messages
Send detailed logs to the user who triggered:
```
Hi John,

Your feature request has been processed!

Issue: #42 Add dark mode toggle
Timeline:
- 10:00 - PRD created
- 10:05 - Plan created
- 10:20 - Code implemented
- 10:25 - Tests passing
- 10:30 - PR ready

Actions taken:
- Created docs/PRD.md
- Created docs/plans/42.md
- Implemented src/lib/theme.ts
- Created src/__tests__/dark-mode.spec.ts (Playwright)

PR: https://github.com/.../pull/10

Next: Review and merge when ready.
```

### Notifications
When workflow is blocked:
```
⚠️ Workflow blocked!

Issue #42: Build failed

Error: TypeScript errors in src/components/Navigation.tsx
- Line 42: Type 'User' has no property 'id'

Status: Rebuilding...
Will retry automatically.
```

---

## Implementation Pattern

### How to Wire Slack to Orchestrator

You have two approaches:

#### Approach A: Direct Slack Webhook

Your Slack slash command sends directly to Claude Code:
```
POST /webhook/slack
{
  "command": "/start-feature",
  "text": "Add dark mode toggle",
  "user_id": "U123",
  "channel_id": "C456"
}

↓

Orchestrator invokes entire workflow

↓

Orchestrator posts back to Slack via webhook:
POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL
{
  "text": "✅ Feature ready! PR: #10"
}
```

#### Approach B: Manual Trigger with Slack Output

User types in Slack, then manually invokes:
```
Slack: "/start-feature Add dark mode"
Human: Copies request to Claude Code
Claude: Runs orchestrator
Claude: Provides output with curl command to post to Slack
Human: Runs curl command
```

Less seamless, but works without webhook setup.

---

## Example Slack Conversation

### User Initiates

```
@john.doe in #ai-features:
/start-feature Add dark mode toggle so users can use the blog at night

[Slack bot responds]
Claude Code:
Starting feature workflow...
Issue #42 created
```

### Real-Time Updates

```
Claude Code [Bot]:
⏳ [10:00] PRD generation starting...

Claude Code [Bot]:
✅ [10:05] PRD created
- Problem: Users report eye strain at night
- Acceptance: Toggle visible, theme persists, Giscus updates
- Design: Sun/moon icon in top-right nav

Claude Code [Bot]:
✅ [10:10] Technical plan created (docs/plans/42.md)
- Files to change: Navigation.tsx, App.tsx, CommentSection.tsx
- Architecture: React Context + localStorage

Claude Code [Bot]:
⏳ [10:15] Building implementation...

Claude Code [Bot]:
✅ [10:25] Feature built and committed
- Created: src/lib/theme.ts (Context provider)
- Modified: 3 components
- Commit: feat: Add dark mode toggle

Claude Code [Bot]:
⏳ [10:25] Running Playwright UI tests...

Claude Code [Bot]:
✅ [10:30] All tests passing! (12/12)
- Toggle renders ✓
- Click toggles theme ✓
- Theme persists ✓
- Giscus updates ✓
- Accessibility ✓

Claude Code [Bot]:
✅ [10:35] Code review approved
- Acceptance criteria: ✅ All met
- Blockers: None
- Suggestions: None

Claude Code [Bot]:
✅ [10:40] Draft PR created!

🎉 Feature workflow complete!

**Issue:** #42 Add dark mode toggle
**PR:** #10 (Draft, ready for review)
**Timeline:** 40 minutes start-to-finish

Links:
- PRD: https://github.com/.../blob/.../docs/PRD.md#dark-mode
- Plan: https://github.com/.../blob/.../docs/plans/42.md
- PR: https://github.com/.../pull/10

Next: Review and merge when ready!
```

### Human Reviews and Merges

```
@john.doe:
Great work! I reviewed the PR. Looks good. Merging now.

Claude Code [Bot]:
✅ PR #10 merged!
Deployed to GitHub Pages: https://aditibhatnagar.com

Feature #42 is live! 🚀
```

---

## Error Scenarios in Slack

### Build Failed

```
⚠️ Build failed!

Issue #42: Build step failed

Error: npm run lint
- Line 67 in Navigation.tsx: unused variable 'oldTheme'
- Line 90: Missing type annotation on parameter

Status: Retrying (attempt 2/3)
Invoking Builder to fix errors...

[waits]

✅ Build succeeded on retry
Proceeding with tests...
```

### Tests Failed

```
⚠️ Tests failed!

Issue #42: Playwright test failures

Failed:
❌ "dark mode toggle works" (timeout waiting for button)
❌ "theme persists" (localStorage not found)

Status: Retrying
Invoking Builder to fix test failures...

[waits]

✅ Tests passing on retry
All 12 tests green ✓
```

### Blocker from Review

```
⚠️ Review found blockers!

Issue #42

Blocker 1: Giscus theme not updating
- Expected: Comments show dark theme
- Actual: Comments still light
- Fix needed: Check theme context in CommentSection.tsx

Blocker 2: Incognito mode fails
- localStorage unavailable in private browsing
- Needs fallback to system preference

Status: Rebuilding...
Builder is addressing these blockers.

[waits]

✅ Blockers fixed!
Re-testing and re-reviewing...

[tests pass, review approves]

✅ Ready to merge!
```

### Max Retries Reached

```
❌ Workflow stuck!

Issue #42: Max rebuild attempts reached (3/3)

Last error: Builder unable to fix Giscus integration
Multiple attempts failed to resolve.

Status: ESCALATED
Action needed: Manual intervention required

Context:
- Issue: #42
- Error: Giscus comments not responding to theme changes
- Logs: [available in GitHub issue comments]

Please manually debug or contact team.
```

---

## Slack Message Format

### Successful Workflow

```
✅ Feature workflow complete!

**Issue:** #42 Add dark mode toggle
**PR:** #10
**Timeline:** 40 minutes

📊 Metrics:
- Acceptance criteria: 5/5 ✅
- Test coverage: 12 Playwright tests ✅
- Code review: Approved ✅
- Lint: Passing ✅

📎 Artifacts:
- PRD: docs/PRD.md
- Plan: docs/plans/42.md
- Tests: src/__tests__/dark-mode.spec.ts

🔗 PR: https://github.com/.../pull/10

Next: Review and merge
```

### Blocked Workflow

```
⚠️ Workflow blocked!

**Issue:** #42 Add dark mode toggle
**Status:** Failed on attempt 3/3
**Error:** Giscus integration not responding

**Last action:** Builder
**Retries exhausted:** Yes

🚨 Manual intervention needed

📎 Context:
- Issue: https://github.com/.../issues/42
- Logs: [attached or linked]
- Branch: main (feature partially implemented)

**Next:** Contact team or debug manually
```

---

## For Your Team

### Benefits of Slack Integration

1. **Discovery** — "What's Claude building right now?" → Check #ai-features
2. **Transparency** — Status updates every 5 minutes
3. **Speed** — `/start-feature` is faster than creating issues manually
4. **Async** — Don't need to stay in Slack; Orchestrator posts when done
5. **Notifications** — Get pinged when PR is ready

### Recommended Channels

- `#ai-features` — Public channel for feature workflows
- `#ai-errors` — Escalations and blockers
- Direct messages — Personal notifications to requestor

---

## Configuration Example

### Slack App Manifest (for quick setup)

```yaml
_metadata:
  major_version: 1
  minor_version: 1

display_information:
  name: Claude Code AI

features:
  slash_commands:
    - command: /start-feature
      description: Start AI-assisted feature development
      usage_hint: "[feature description]"
      should_escape: false

oauth_config:
  scopes:
    bot:
      - chat:write
      - commands
      - users:read

settings:
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

---

**Last updated:** 2026-05-25
