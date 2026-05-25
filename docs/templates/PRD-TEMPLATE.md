# PRD Template

**Use this template when generating Product Requirements Documents (PRDs).**

Copy this template structure and fill in each section. Remove sections that don't apply, but keep the core sections.

---

## [Feature Name]

**Issue:** #[number]  
**Status:** Spec Complete | In Progress | Done  
**Priority:** Critical | High | Medium | Low  
**Effort Estimate:** XS | S | M | L | XL  

---

## Problem Statement

[2-3 sentences describing the user problem or business need]

**User Impact:**
- [Who is affected?]
- [How are they affected?]
- [What's the consequence of not doing this?]

**Business Impact:**
- [Why does this matter to the company?]
- [What metric improves?]
- [What metric worsens if we don't do this?]

---

## Acceptance Criteria

### Must Have (Feature Incomplete Without These)
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Should Have (Nice To Have)
- [ ] Criterion 4
- [ ] Criterion 5

### Out of Scope
- Not doing X
- Not including Y
- Not supporting Z

---

## User Stories

```
As a [user type],
I want [feature/action],
so that [benefit/outcome].

Acceptance:
- [ ] Subcriterion A
- [ ] Subcriterion B
```

[Repeat for each story]

---

## Design & Architecture

### User Experience
- **UI location:** Where does this live?
- **Interaction:** How does the user trigger it?
- **Feedback:** What does the user see/hear?
- **Accessibility:** WCAG AA compliant? Keyboard nav?

### Technical Architecture
- **State management:** Where is state stored?
- **Data flow:** How does data move?
- **External dependencies:** APIs, services, third-party tools?
- **Performance targets:** Load time, response time?

### Design Mockup / Sketch
[ASCII art, description, or link to figma/design tool]

---

## Dependencies & Integration

### Internal Dependencies
- [Component/system this depends on]
- [Data that must be available]
- [Other features that must exist first]

### External Dependencies
- [Third-party APIs]
- [External services]
- [Infrastructure requirements]

### Enables Future Work
- [What future features does this unblock?]
- [What does this lay groundwork for?]

---

## Risks & Unknowns

### Risks (Things That Could Go Wrong)

**Risk 1: [Description]**
- Impact: High | Medium | Low
- Likelihood: High | Medium | Low
- Mitigation: [How to prevent or handle]

**Risk 2: [Description]**
- Impact: [Impact]
- Likelihood: [Likelihood]
- Mitigation: [Mitigation]

### Unknowns (Questions We Can't Answer Yet)

- [Question 1]?
- [Question 2]?
- [How do we handle X?]

---

## Timeline & Resources

### Effort Breakdown
- Design/Specification: [days]
- Technical Planning: [days]
- Implementation: [days]
- Testing: [days]
- Deployment: [days]
- **Total: [X] days**

### Resource Requirements
- Developer hours: [X days of 1 engineer]
- Designer hours: [X hours]
- QA hours: [X hours]
- Infrastructure: [Any special setup?]

### Timeline
- **Spec Review:** [date]
- **Technical Planning:** [date]
- **Implementation Start:** [date]
- **QA Testing:** [date]
- **Deployment:** [date]

---

## Success Metrics

### How Do We Know This Worked?

- **Metric 1:** [Measurable outcome]
  - Target: [number]
  - Current baseline: [number]

- **Metric 2:** [Measurable outcome]
  - Target: [number]
  - Current baseline: [number]

- **Metric 3:** [Measurable outcome]
  - Target: [number]
  - Current baseline: [number]

### Launch Checklist
- [ ] All acceptance criteria met
- [ ] Tests passing (>80% coverage)
- [ ] Security review complete
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Team trained (if needed)
- [ ] Rollback plan prepared

---

## Rollback & Contingency

### Rollback Procedure
[If something goes wrong, how do we revert?]
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Contingency Plans
- **If X happens:** Then do Y
- **If A fails:** Then do B

---

## Open Questions for Stakeholders

- [Question 1]?
- [Question 2]?
- [Decision needed on X]?

---

## Approvals

| Role | Name | Date | Notes |
|------|------|------|-------|
| Product Lead | [ ] | [ ] | [ ] |
| Tech Lead | [ ] | [ ] | [ ] |
| Design Lead | [ ] | [ ] | [ ] |
| Other | [ ] | [ ] | [ ] |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [date] | [name] | Initial spec |
| 1.1 | [date] | [name] | Clarified acceptance criteria |

---

## Related Documents

- Tech Plan: `docs/plans/[issue].md`
- Spec: `docs/spec/[issue].md`
- ADR: `docs/ADRs/[number]-[title].md`
