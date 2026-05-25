# AI-Native SDLC for Legacy Codebases

This guide teaches how to use Claude Code to actually improve velocity on legacy codebases. Most teams use Claude passively (ask → get answer → paste). We're going to use it actively (embed it in your workflow, automate tasks, build shared understanding).

---

## The Problem With Legacy Code + Passive Claude Use

**What teams usually do:**
- Ask Claude "how does this module work?" → get a lengthy explanation → forget it next week
- Copy-paste large code snippets into chat → Claude gets confused → output is wrong
- Try to refactor without tests → breaks production → stop using Claude for risky work
- One person figures something out → doesn't get documented → next person re-learns it

**Why velocity doesn't improve:** You're still doing the hard cognitive work. Claude is just a faster Google.

---

## How AI-Native SDLC Works (The Right Way)

### **1. Reverse-Engineer With Context, Not Fragments**

**❌ Wrong approach:**
```
User: "What does this function do?"
[pastes 100 lines of function]
```
→ Claude guesses. Code context gets lost. Output is generic.

**✅ Right approach:**
- Point Claude at the actual file: `Read the repository structure first`
- Ask targeted questions: *"In module X, what's the data flow from request to database?"*
- Use Claude Code's file tools: Claude reads files directly, understands the full context
- Build a memory: Document what you learned so next person doesn't re-learn it

**Example prompt for legacy code:**
```
I'm onboarding to the auth module in our legacy codebase.
I need to understand: 
1. Where user login starts
2. How tokens are validated
3. Where permissions are checked

Read the relevant files and show me the flow, then identify any risky patterns or tech debt.
```

Claude reads the files, gives you a clear mental model, identifies risks. Much better than pasting code.

---

### **2. Test-First Refactoring (The Safe Way)**

Legacy code is risky to change. Claude's strength is generating tests *before* refactoring.

**Pattern:**
1. Ask Claude to generate comprehensive tests for the function/module you want to refactor
2. Run the tests (they should pass on the current code)
3. Refactor with confidence—tests catch breakage
4. Claude helps you fix issues the tests found

**Example workflow:**
```
Task: Simplify the payment processing function (it's 200 lines, unclear logic)

Step 1 (Claude): "Generate unit tests for the PaymentProcessor class. 
Cover: valid payment, invalid card, network timeout, refund flow."

Step 2 (You): Run tests on current code → all pass

Step 3 (Claude): "Refactor PaymentProcessor to be simpler and clearer.
Keep the same behavior—tests will verify this."

Step 4 (You): Run tests again → all pass → ship with confidence
```

This transforms refactoring from "scary and risky" to "methodical and safe."

---

### **3. Use Agents for Recurring Tasks**

Don't ask Claude the same question 10 times. Build an agent.

**Common legacy codebase agents:**
- **Test Generator Agent**: "Generate tests for untested legacy functions"
- **Documentation Agent**: "Extract and document what this module does"
- **Refactoring Advisor Agent**: "Identify risky patterns and suggest improvements"
- **Onboarding Agent**: "Explain how feature X flows through the codebase"

**How to request this in Claude Code:**

When you find yourself asking Claude the same type of question repeatedly, ask:
```
I keep needing to understand how different modules interact.
Build me a custom agent that:
1. Takes a module name
2. Maps its dependencies
3. Explains the data flow
4. Identifies bottlenecks

Show me how to use it.
```

Claude will create a reusable agent you can run on any module.

---

### **4. Use Hooks to Automate Safety Checks**

Hooks are automations that run when you take an action (save file, create commit, etc).

**Smart hooks for legacy code:**
- **Auto-test on save**: When you modify a legacy file, tests run automatically. Catch breakage immediately.
- **Pre-commit linting**: Before you commit, code is checked against standards.
- **Test coverage check**: Warn if you're adding code without tests.

**Example hook configuration** (in your project's `.claude/settings.json`):
```json
{
  "hooks": {
    "fileChanged": {
      "patterns": ["src/**/*.py"],
      "runCommand": "npm test -- --testPathPattern=$(echo $FILE | sed 's|.*/||; s|.py$||')"
    }
  }
}
```

This means: *"Whenever I modify a .py file, automatically run its tests. I catch errors immediately instead of in production."*

---

### **5. Build Memory (Shared Understanding)**

Legacy codebases have tribal knowledge. Claude's memory system lets you capture it once, reuse forever.

**What to document:**
- **Module overviews**: "Payment module: handles Stripe integration, processes refunds, stores receipts"
- **Tricky patterns**: "Auth tokens use JWT with 1-hour expiry. Refresh tokens stored in DB with rotation."
- **Gotchas**: "Never modify the User schema directly—migration scripts are in /db/migrations."
- **Architecture decisions**: "We use event sourcing in this subsystem because of..." 

**How it works:**
1. First time you learn something surprising, save it: `Claude, remember: [insight]`
2. Claude stores it in a project memory file
3. Next time you work on related code, Claude automatically knows the context
4. New team members inherit the knowledge—no re-learning

**Example memory:**
```markdown
---
name: payment_module_stripe_quirk
description: Stripe refund timing issue specific to our legacy setup
metadata:
  type: project
---

Our Stripe refunds have a 3-5 minute delay due to a batch job that runs every 5 min.
If you're adding refund features, must account for this delay in tests.
Ticket #1234 has details on why we can't move to real-time refunds yet.
```

New person works on refunds → Claude reminds them of the 3-5 minute delay → no confusion.

---

## Concrete Daily Workflows

### **Scenario 1: "I need to add a feature to a module I don't fully understand"**

```
Prompt to Claude Code:
"I need to add [feature] to [legacy module]. 
First, walk me through how [module] currently works.
Then show me where I need to make changes.
Finally, generate tests for my changes before I code."
```

Claude will:
1. Read the module files
2. Explain the current flow clearly
3. Show you exactly where to add code
4. Generate tests so you can code confidently
5. Verify your changes work

**Time saved:** 2-3 hours of confused reading → 30 min of clear understanding + safe implementation.

---

### **Scenario 2: "This legacy code is slow/broken/confusing"**

```
Prompt to Claude Code:
"Analyze [file/module] for:
1. Performance bottlenecks (what's slow?)
2. Correctness issues (what could break?)
3. Clarity problems (what's confusing?)

For each issue, show me a fix + tests that verify it."
```

Claude will prioritize by impact and give you safe, testable solutions.

**Result:** Methodical improvement instead of random hacking.

---

### **Scenario 3: "A new person is joining the team"**

Instead of "read the codebase for a week," build an onboarding agent:

```
Prompt to Claude Code:
"Create an onboarding agent that:
1. Explains our system architecture in 5 minutes
2. Shows the most common workflows (user signup, payment, etc.)
3. Lists 'gotchas' to be aware of
4. Points to key files

Make it interactive so new people can ask follow-up questions."
```

New hire gets context in hours, not weeks.

---

## Anti-Patterns (What NOT to Do)

❌ **Dump entire files into chat**  
→ Use Claude Code's file tools instead. Let Claude read files directly.

❌ **Ask vague questions**  
→ "How do I make this faster?" → Ask Claude to *analyze specific code* for bottlenecks.

❌ **One-off conversations with no memory**  
→ Document insights so the team learns together.

❌ **Ask Claude to refactor massive modules at once**  
→ Break into smaller pieces. Test first. Iterate.

❌ **Trust output without tests**  
→ Always run tests. Legacy code changes can have subtle bugs.

❌ **Don't use hooks/agents/skills**  
→ These are force multipliers. They turn one-off work into repeatable systems.

---

## Quick Start: Set Up Your First Agent

**Goal:** Build an agent that explains any module in your codebase in 2 minutes.

```
Prompt:
"Create a custom Claude Code agent called 'explain-module' that:

1. Takes a file or directory path as input
2. Reads the files in that path
3. Generates:
   - A clear summary of what this module does
   - The main functions/classes and their purposes
   - Dependencies (what does it import/rely on?)
   - Data flow (how does data move through this?)
   - Known issues or tech debt

Then show me how to use it."
```

Claude will give you a reusable agent. Now whenever someone asks "what does X do?", you run the agent instead of spending an hour reading code.

---

## Key Principles

1. **Context > Fragments**: Point Claude at whole files, not snippets
2. **Test Before Change**: Generate tests first, refactor second
3. **Automate Repetition**: Build agents for things you ask repeatedly
4. **Document Learnings**: Use memory to capture insights once, reuse forever
5. **Hook Into Workflow**: Use automation to catch issues early
6. **Verify In The Real App**: Don't just run tests—actually use the feature to make sure it works

---

## Next Steps

1. **Pick one pain point** in your legacy codebase (slowness, unclear flow, untested code)
2. **Ask Claude Code to solve it** using the patterns above
3. **Document what you learned** so the team benefits
4. **Build an agent** if you find yourself asking the same question twice
5. **Set up a hook** to automate the safety checks

---

## Resources

- **Claude Code CLI**: `claude code <your-repo>` — faster than web chat for real work
- **Custom Agents**: Ask Claude to build agents for your specific workflows
- **Memory System**: Use `/remember` to capture tribal knowledge
- **Hooks**: Configure `.claude/settings.json` to automate checks
- **Skills**: Use available skills like `/review` (code review), `/verify` (test in real app)

---

## Questions?

If the team is stuck, have them ask: *"I'm working with legacy code and trying to [specific task]. Show me the best Claude-native way to approach this."*

The key is **deliberate use**, not passive chatting.
