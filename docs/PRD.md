# PRD: Add a Footer with Copyright Year

**Issue:** #3
**Status:** Spec Complete
**Priority:** Low
**Effort Estimate:** XS

---

## Problem Statement

The blog site has no dedicated footer component, leaving the bottom of every page blank. A footer with a copyright year is a standard expectation for professional web sites and establishes ownership of the content.

**User Impact:**
- Visitors who scroll to the bottom of any page see an empty, unfinished edge
- The absence of copyright notice creates an ambiguous ownership signal
- The site feels incomplete compared to professional blogs

**Business Impact:**
- A footer with copyright year is a baseline credibility signal for a personal brand/portfolio site
- It establishes content ownership date clearly
- Without it, the site appears unfinished

---

## Acceptance Criteria

### Must Have (Feature Incomplete Without These)
- [ ] A footer element renders at the bottom of every page
- [ ] Footer displays the copyright symbol (©) and the current calendar year, computed dynamically (not hardcoded)
- [ ] Footer text includes the site owner's name or handle ("aditi.")
- [ ] Footer appears below all page content on every route

### Should Have (Nice To Have)
- [ ] Footer is responsive on mobile and desktop viewports
- [ ] Footer styling matches the existing site design (uses Tailwind utility classes consistent with the rest of the site)
- [ ] Footer includes a secondary tagline or tech stack attribution (e.g., "obsidian + react") to match the site's personality
- [ ] Footer respects future dark mode (uses semantic color tokens, not hardcoded light-mode colors)

### Out of Scope
- Social media links in the footer
- Navigation links in the footer
- Newsletter signup in the footer
- Multi-language copyright text
- Dark mode toggle (tracked separately)

---

## User Stories

```
As a blog visitor,
I want to see a footer at the bottom of every page,
so that I know the site is complete and owned by the author.

Acceptance:
- [ ] Footer is visible on Home, About, Bookmarks, Projects, Writing, and any other routes
- [ ] Footer shows the current year (e.g., "© 2026 aditi.")
- [ ] Year updates automatically on January 1 without a code change
```

```
As the site owner,
I want the copyright year to be computed dynamically,
so that I never need to update it manually.

Acceptance:
- [ ] Year is derived from new Date().getFullYear() or equivalent
- [ ] No hardcoded year string appears in the source
```

---

## Design & Architecture

### User Experience
- **UI location:** Bottom of every page, inside the existing `Layout` component
- **Interaction:** Static — no user interaction required
- **Feedback:** Always visible when the user reaches the bottom of the page
- **Accessibility:** Footer text must meet WCAG AA contrast. Use semantic `<footer>` element.

### Technical Architecture
- **Implementation:** Add or enhance the `<footer>` element inside `blog-site/site/src/components/Layout.tsx`
- **Year computation:** `new Date().getFullYear()` evaluated at render time — always accurate
- **State management:** None needed — purely derived/static value
- **Data flow:** No external data; computed inline
- **External dependencies:** None

### Design Mockup

```
+----------------------------------------------------------+
|  © 2026 aditi.                     obsidian + react      |
+----------------------------------------------------------+
```

Desktop: two-column flex row (copyright left, tagline right)
Mobile: stacks vertically or remains on one line (flex-wrap)

---

## Dependencies & Integration

### Internal Dependencies
- `blog-site/site/src/components/Layout.tsx` — footer goes here
- Tailwind v4 — styling utilities
- React Router v7 — Layout wraps all routes via `<Outlet />`

### External Dependencies
- None

### Enables Future Work
- Footer link section (social links, nav links)
- Dark mode styling (footer already uses semantic tokens)

---

## Risks & Unknowns

**Risk 1: Footer already partially exists**
- Impact: Low
- Likelihood: Medium
- Mitigation: Check Layout.tsx for an existing `<footer>` tag before implementing; enhance rather than duplicate

**Risk 2: Year hardcoded accidentally**
- Impact: Low
- Likelihood: Low
- Mitigation: Code review checks for string literals that look like years

### Unknowns
- Should the footer link to an external page (GitHub, LinkedIn)? (Out of scope for now)
- Should the footer include a "built with" attribution to Claude Code? (Out of scope for now)

---

## Timeline & Resources

### Effort Breakdown
- Specification: 0.1 days
- Technical Planning: 0.1 days
- Implementation: 0.25 days
- Testing: 0.25 days
- **Total: < 1 day**

### Resource Requirements
- Developer hours: 1–2 hours of 1 engineer

---

## Success Metrics

### How Do We Know This Worked?

- **Metric 1:** Footer visible on every page route
  - Target: 100% of routes
  - Current baseline: 0% (no footer)

- **Metric 2:** Year shown is dynamically computed
  - Target: `new Date().getFullYear()` used; no hardcoded year
  - Current baseline: N/A

### Launch Checklist
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Build passes with no lint errors
- [ ] Footer visible on all routes in local dev

---

## Rollback & Contingency

### Rollback Procedure
1. Revert the commit that adds the footer to `Layout.tsx`
2. Run `npm run build` to confirm the build still passes
3. Push the revert to trigger a new deploy

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-25 | Specifier agent | Initial spec |

---

## Related Documents

- Tech Plan: `docs/plans/3.md`
- Spec: `docs/spec/3.md`
