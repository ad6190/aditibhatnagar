# ADR Template

**Use this template when creating Architectural Decision Records.**

Each significant architecture decision gets one ADR. Specifier creates these per feature; Scaffolder creates them for existing decisions.

---

# ADR [Number]: [Decision Title]

**Date:** [YYYY-MM-DD]  
**Status:** Accepted | Proposed | Deprecated | Superseded  
**Supersedes:** [ADR-X if this replaces an earlier decision]  
**Superseded By:** [ADR-Y if a newer decision replaces this]  

---

## Context

[Describe the issue or decision that prompted this ADR. What problem are we trying to solve? What constraints exist?]

**Background:**
- [Relevant context point 1]
- [Relevant context point 2]
- [Any constraints or requirements]

**Trigger:**
- [What prompted this decision? A bug? A feature? A refactoring need?]

---

## Decision

[Clearly state what we decided to do. Be specific and unambiguous.]

**We will [action] because [primary reason].**

**Key aspects of this decision:**
1. [Aspect 1]
2. [Aspect 2]
3. [Aspect 3]

---

## Consequences

### Positive Consequences (Pros)
- **Benefit 1:** [Description and impact]
- **Benefit 2:** [Description and impact]
- **Benefit 3:** [Description and impact]

### Negative Consequences (Cons)
- **Trade-off 1:** [Description and impact]
- **Trade-off 2:** [Description and impact]

### Implementation Requirements
- [Requirement 1: What needs to change to support this decision?]
- [Requirement 2]
- [Requirement 3]

---

## Alternatives Considered

### Alternative 1: [Name]
**Description:** [What would this approach be?]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Why we didn't choose it:** [Brief explanation]

---

### Alternative 2: [Name]
**Description:** [What would this approach be?]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Why we didn't choose it:** [Brief explanation]

---

## Related Decisions

- **ADR-[X]:** [Related decision - same area]
- **ADR-[Y]:** [Related decision - builds on this]

---

## Implementation Notes

[How will we implement this decision? Any gotchas?]

- [Implementation detail 1]
- [Implementation detail 2]
- [Watch out for: X]

---

## Open Questions

- [Question 1]?
- [Question 2]?

---

## Review & Approval

| Role | Reviewer | Date | Comments |
|------|----------|------|----------|
| Tech Lead | [ ] | [ ] | [ ] |
| Architect | [ ] | [ ] | [ ] |
| Other | [ ] | [ ] | [ ] |

---

## History

| Date | Author | Status | Change |
|------|--------|--------|--------|
| [date] | [name] | Proposed | Initial proposal |
| [date] | [name] | Accepted | Approved after discussion |

---

## Examples & Further Reading

[Optional: Links to code examples, related docs, external resources]

- [Link to code implementing this]
- [Link to external reference]
- [Related documentation]

---

## Template Notes

**When to create an ADR:**
- Major architecture decision (state management, persistence, auth strategy)
- Technology choice (framework, library, database)
- Design pattern decision (context vs redux, monolith vs microservices)
- Performance/scalability decisions

**When NOT to create an ADR:**
- Bug fixes
- Minor refactoring
- Documentation updates
- Configuration changes (unless they're system-level)

**ADR Numbering:**
- Use sequential numbers (001, 002, 003...)
- Don't renumber; keep the historical record
- If superseded, mark it and reference the new ADR
