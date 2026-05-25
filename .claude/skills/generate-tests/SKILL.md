---
name: generate-tests
description: Generate comprehensive tests for a feature - scaffolds test runner, creates full test coverage including happy path, edge cases, accessibility
---

# Generate Tests Skill

## Usage
```
/generate-tests <file-path>
```

Examples:
```
/generate-tests src/components/Navigation.tsx

/generate-tests src/lib/theme.ts

/generate-tests src/pages/Home.tsx
```

## What This Does
Invokes the **Test-Generator agent** to:
1. Read the component/function you specify
2. Scaffold Vitest if not present (one-time setup)
3. Generate **comprehensive** tests covering:
   - Happy path (feature works as specified)
   - Edge cases (null, undefined, empty, boundaries)
   - Error states (what if X fails?)
   - Accessibility (ARIA, keyboard nav, focus)
   - Integration (how does it interact with the system?)
4. Write tests to `src/__tests__/<ComponentName>.test.tsx`
5. Run tests and fix failures until all pass

## Why "Full Tests"?

We don't generate skeleton tests. We generate **complete, passing test suites** that cover:
- **Happy path:** Component renders, feature works
- **Edge cases:** Boundary conditions, null inputs, empty states
- **Error handling:** What happens when API fails, user input is invalid?
- **Accessibility:** ARIA labels, keyboard navigation, focus management
- **Integration:** How does this component work with the rest of the system?

All tests must pass before the feature is considered complete.

## Pre-requisites
- Feature has been built (`/build-issue` run first)
- Code is committed and passing lint/build checks
- Codebase uses React/TypeScript (for component tests)

## When to Use This Skill

**Use it when:**
- Feature is built and ready for testing
- You want comprehensive test coverage
- Before merging to main (ensures code quality)

## Workflow

```
1. /specify-feature "..." → Specifier creates PRD
2. /plan-issue <number> → Planner creates technical plan
3. /build-issue <number> → Builder implements feature
4. /generate-tests src/components/Navigation.tsx → Test-Generator creates tests
5. Merge PR (all tests passing)
6. Deploy to production
```

## Output

**File:** `src/__tests__/<ComponentName>.test.tsx`

Contains:
- Happy path tests
- Edge case tests
- Error handling tests
- Accessibility tests
- Integration tests

**Example:**
```typescript
// src/__tests__/Navigation.test.tsx

describe('Navigation', () => {
  describe('Happy path', () => {
    it('renders navigation links', () => { ... });
    it('dark mode toggle is visible', () => { ... });
  });

  describe('Edge cases', () => {
    it('handles localStorage disabled (incognito)', () => { ... });
    it('loads system preference on first render', () => { ... });
  });

  describe('Accessibility', () => {
    it('toggle button is keyboard accessible', () => { ... });
    it('toggle button has aria-label', () => { ... });
  });

  describe('Integration', () => {
    it('toggle updates Giscus theme', () => { ... });
  });
});
```

## Instructions for Claude

Extract the file path from the user's input (e.g., `/generate-tests src/components/Navigation.tsx` → path is `src/components/Navigation.tsx`).

Invoke the `test-generator` sub-agent with that file path.

The test-generator will:
1. Check if Vitest is configured (scaffold if needed)
2. Read the component/function
3. Understand what to test (from the code, or from docs/spec if available)
4. Generate comprehensive tests
5. Write test file to `src/__tests__/`
6. Run tests and fix failures
7. Report coverage and passing tests

## For Team Session

**Teaching point:** "We generate tests AFTER building (not before). This is about verifying what was built works, not designing by tests. Tests cover happy path, edge cases, and accessibility."
