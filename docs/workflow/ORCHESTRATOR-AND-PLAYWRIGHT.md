# Orchestrator & Playwright: Complete Architecture

The **Orchestrator** is the master conductor that automates the entire feature workflow from Slack to PR. **Playwright** replaces unit tests with real browser UI testing.

---

## System Architecture

```
SLACK                          GITHUB                         CODEBASE
  ↓                              ↓                               ↓

User runs:
/start-feature "Add dark mode"
        ↓
   [Webhook]
        ↓
  ORCHESTRATOR AGENT
  ├─ 1. Create issue #42
  ├─ 2. Invoke Specifier → PRD
  ├─ 3. Invoke Planner → Plan
  ├─ 4. Invoke Builder → Code
  ├─ 5. Invoke Test-Generator → Playwright tests
  ├─ 6. Invoke Reviewer → Code review
  ├─ 7. Handle rebuilds if needed
  ├─ 8. Create draft PR #10
  └─ 9. Report to Slack
        ↓
  [Status updates every 5 min]
        ↓
  SLACK: "✅ PR ready: #10"
        ↓
  [Human reviews on GitHub]
        ↓
  [Human merges PR]
        ↓
  GitHub Actions deploy
        ↓
  Production ✅
```

---

## The Six Agents (Now with Orchestrator)

### 1. Scaffolder
- **When:** One-time setup
- **Does:** Extract codebase knowledge → docs/CLAUDE.md
- **Invoked by:** Manual `/scaffold-project` or initial setup
- **Key:** All other agents read these docs

### 2. Specifier
- **When:** Per feature
- **Does:** Create PRD → docs/PRD.md, docs/spec/<issue>.md, ADRs
- **Invoked by:** Orchestrator (after GitHub issue created)
- **Key:** Product thinking before technical thinking

### 3. Planner
- **When:** Per feature (after PRD approved)
- **Does:** Create technical plan → docs/plans/<issue>.md
- **Invoked by:** Orchestrator (after Specifier completes)
- **Key:** Breaks PRD into technical tasks

### 4. Builder
- **When:** Per feature (after plan approved)
- **Does:** Implement feature, commit, push
- **Invoked by:** Orchestrator (after Planner completes)
- **Key:** Follows plan exactly, no improvisation

### 5. Test-Generator
- **When:** After build (per feature)
- **Does:** Generate Playwright UI tests, run them
- **Invoked by:** Orchestrator (after Builder completes)
- **Key:** Real UI testing, not mocked unit tests

### 6. Orchestrator (NEW)
- **When:** On-demand from Slack
- **Does:** Conducts entire workflow, handles errors, creates PRs
- **Invoked by:** Slack slash command `/start-feature`
- **Key:** Master conductor, doesn't build (delegates)

---

## Playwright Instead of Unit Tests

### Why Playwright for UI Testing

**Old approach (Unit Tests):**
```typescript
// Mocked, doesn't test real behavior
test('toggle works', () => {
  render(<Navigation />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockContext.setTheme).toHaveBeenCalled(); // Just a mock!
});
```

**Problem:** Mock passes, but real app fails (component props wrong, actual DOM didn't update, etc.)

**New approach (Playwright E2E):**
```typescript
// Real browser, real UI, real behavior
test('dark mode toggle works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // User sees toggle button
  const toggle = page.getByRole('button', { name: /toggle/i });
  await expect(toggle).toBeVisible();
  
  // User clicks toggle
  await toggle.click();
  
  // Real DOM updated
  await expect(page.locator('html')).toHaveClass('dark');
  
  // Giscus comments actually show dark theme
  const giscusFrame = page.frameLocator('iframe[src*="giscus"]');
  const darkThemeAttr = await giscusFrame.locator('[data-theme="dark"]').count();
  expect(darkThemeAttr).toBeGreaterThan(0);
  
  // Reload page - localStorage actually persists
  await page.reload();
  await expect(page.locator('html')).toHaveClass('dark');
});
```

### Test Coverage with Playwright

```typescript
// src/__tests__/dark-mode.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dark Mode Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Start on local dev server
    await page.goto('http://localhost:3000');
  });

  test.describe('Happy Path', () => {
    test('toggle button is visible', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      await expect(toggle).toBeVisible();
    });

    test('clicking toggle switches theme', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      const html = page.locator('html');
      
      // Initially light
      await expect(html).not.toHaveClass('dark');
      
      // Click toggles to dark
      await toggle.click();
      await expect(html).toHaveClass('dark');
      
      // Click again toggles to light
      await toggle.click();
      await expect(html).not.toHaveClass('dark');
    });

    test('all text is readable in dark mode', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      await toggle.click();
      
      // Text should be light on dark background
      const heading = page.locator('h1');
      const color = await heading.evaluate(el => 
        window.getComputedStyle(el).color
      );
      
      // Light gray or white
      expect(['rgb(255, 255, 255)', 'rgb(230, 230, 230)']).toContain(color);
    });
  });

  test.describe('Edge Cases', () => {
    test('theme persists after page reload', async ({ page, context }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      
      // Set dark mode
      await toggle.click();
      await expect(page.locator('html')).toHaveClass('dark');
      
      // Reload page (browser keeps localStorage)
      await page.reload();
      
      // Should still be dark
      await expect(page.locator('html')).toHaveClass('dark');
    });

    test('works in incognito mode (system preference fallback)', async ({ browser }) => {
      const incognitoContext = await browser.newContext({ 
        ignoreHTTPSErrors: true
      });
      const page = await incognitoContext.newPage();
      await page.goto('http://localhost:3000');
      
      // Even without localStorage, should load system preference
      const isDark = await page.evaluate(() => 
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      
      const htmlClass = await page.locator('html').getAttribute('class');
      if (isDark) {
        expect(htmlClass).toContain('dark');
      }
      
      await incognitoContext.close();
    });

    test('Giscus comments show correct theme', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      await toggle.click();
      
      // Check Giscus iframe
      const giscusFrame = page.frameLocator('iframe[src*="giscus"]');
      
      // Giscus should have dark theme attribute
      const darkAttr = await giscusFrame.locator('[data-theme="dark"]').count();
      expect(darkAttr).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('toggle button is keyboard accessible', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      
      // Tab to button
      await page.keyboard.press('Tab');
      
      // Button should be focused
      await expect(toggle).toBeFocused();
      
      // Enter should toggle
      await page.keyboard.press('Enter');
      await expect(page.locator('html')).toHaveClass('dark');
    });

    test('toggle button has proper ARIA labels', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      
      // Should have aria-label or visible text
      const ariaLabel = await toggle.getAttribute('aria-label');
      const textContent = await toggle.textContent();
      
      expect(ariaLabel || textContent).toBeTruthy();
    });
  });

  test.describe('Integration', () => {
    test('navigation, main content, and comments all update together', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      
      // Toggle dark mode
      await toggle.click();
      
      // Navigation dark
      const nav = page.locator('nav');
      await expect(nav).toHaveClass('dark');
      
      // Main content dark
      const main = page.locator('main');
      const mainBg = await main.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(mainBg).toMatch(/rgb\(20|25|30|35\)/); // Dark gray
      
      // Comments dark (Giscus)
      const giscusFrame = page.frameLocator('iframe[src*="giscus"]');
      await expect(giscusFrame.locator('[data-theme="dark"]')).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('toggle responds within 100ms', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /toggle/i });
      
      const start = Date.now();
      await toggle.click();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    test('theme loads on page load without flash', async ({ page, context }) => {
      // Set system preference to dark
      await context.addInitScript(() => {
        // Simulate dark preference
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {}
          })
        });
      });
      
      // Load page
      await page.goto('http://localhost:3000');
      
      // Should load dark immediately (no flash of light)
      await expect(page.locator('html')).toHaveClass('dark');
    });
  });
});
```

### Running Playwright Tests

```bash
# Development (headed - see browser)
npm run test:ui -- --headed

# CI/CD (headless)
npm run test:ui

# Specific test file
npm run test:ui dark-mode.spec.ts

# With debugging
npx playwright test --debug

# Generate test report
npm run test:ui && npx playwright show-report
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint src",
    "test": "vitest",                          // Unit tests (if any)
    "test:ui": "playwright test",              // UI tests (Playwright)
    "test:ui:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:ui"
  }
}
```

---

## Complete Workflow with Orchestrator

### From Slack to Production

```
STEP 0: User in Slack
┌─────────────────────────────────────────┐
│ @claude /start-feature                  │
│ "Add dark mode toggle so users can...   │
│  use the blog at night"                 │
└─────────────────────────────────────────┘
         ↓ [Webhook]
         
STEP 1: Orchestrator Starts
┌─────────────────────────────────────────┐
│ ✅ Create GitHub issue #42              │
│ ✅ Post to Slack: "Workflow started"    │
└─────────────────────────────────────────┘
         ↓
         
STEP 2: Specifier Creates PRD
┌─────────────────────────────────────────┐
│ ✅ Read feature request                 │
│ ✅ Generate docs/PRD.md                 │
│ ✅ Generate docs/spec/42.md             │
│ ✅ Create ADR if new decision           │
│ 📡 Post to Slack: "PRD created"         │
└─────────────────────────────────────────┘
         ↓
         
STEP 3: Planner Creates Technical Plan
┌─────────────────────────────────────────┐
│ ✅ Read docs/PRD.md                     │
│ ✅ Read docs/CLAUDE.md                  │
│ ✅ Generate docs/plans/42.md            │
│ 📡 Post to Slack: "Plan created"        │
└─────────────────────────────────────────┘
         ↓
         
STEP 4: Builder Implements Feature
┌─────────────────────────────────────────┐
│ ✅ Read docs/plans/42.md                │
│ ✅ Create/edit files                    │
│ ✅ Run npm run lint → PASS              │
│ ✅ Run npm run build → PASS             │
│ ✅ Git commit + push                    │
│ 📡 Post to Slack: "Feature built"       │
└─────────────────────────────────────────┘
         ↓ [if fails: loop back]
         
STEP 5: Test-Generator Runs Playwright
┌─────────────────────────────────────────┐
│ ✅ Create src/__tests__/dark-mode.spec  │
│ ✅ Run: npm run test:ui                 │
│ ✅ Results: 12/12 passing               │
│ 📡 Post to Slack: "Tests passing"       │
└─────────────────────────────────────────┘
         ↓ [if fails: Builder rebuilds]
         
STEP 6: Reviewer Reviews Code
┌─────────────────────────────────────────┐
│ ✅ Read code diff                       │
│ ✅ Check acceptance criteria            │
│ ✅ Review test coverage                 │
│ ✅ Post review: "Approved"              │
│ 📡 Post to Slack: "Review approved"     │
└─────────────────────────────────────────┘
         ↓ [if blockers: Builder rebuilds]
         
STEP 7: Orchestrator Creates PR
┌─────────────────────────────────────────┐
│ ✅ Create draft PR #10                  │
│ ✅ Link to issue #42                    │
│ ✅ Include artifacts (PRD, plan, tests) │
│ 📡 Post to Slack: "PR ready!"           │
└─────────────────────────────────────────┘
         ↓
         
STEP 8: Human Reviews PR on GitHub
┌─────────────────────────────────────────┐
│ Human opens GitHub                      │
│ Reads PR #10                            │
│ Reviews:                                │
│ - Code changes ✓                        │
│ - Test coverage ✓                       │
│ - Acceptance criteria ✓                 │
│ Approves and clicks "Merge"             │
└─────────────────────────────────────────┘
         ↓
         
STEP 9: GitHub Actions Deploy
┌─────────────────────────────────────────┐
│ ✅ Tests run in CI/CD                   │
│ ✅ Build succeeds                       │
│ ✅ Deploy to GitHub Pages               │
│ ✅ Feature live at https://...          │
└─────────────────────────────────────────┘
         ↓
         
DONE! 🚀
Feature launched from Slack to production in ~45 minutes
```

---

## Skills vs Orchestrator

| When | Use |
|------|-----|
| You want to run one agent manually | Skill: `/plan-issue 42` |
| You want to automate entire workflow from Slack | Orchestrator: `/start-feature` |
| You want to quickly re-run a specific step | Skill: `/build-issue 42` (if build failed) |
| You want hands-off automation | Orchestrator (triggers from Slack, handles everything) |

---

## Summary

You now have:

✅ **Six agents:** Scaffolder, Specifier, Planner, Builder, Test-Generator, Orchestrator
✅ **Orchestrator:** Master conductor for entire workflow
✅ **Playwright:** Real UI testing, not mocked
✅ **Slack integration:** `/start-feature` command
✅ **Automation:** Slack → GitHub issue → workflow → PR → production
✅ **Error handling:** Rebuilds automatically on failures
✅ **Human approval:** Only human can merge PR (safe, not autonomous to production)

---

**Last updated:** 2026-05-25
