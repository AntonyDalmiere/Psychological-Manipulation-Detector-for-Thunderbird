---
description: "Use when reviewing commits, pull requests, or code changes. Enforces atomic commits: each PR solves one bug, adds one feature, or performs one refactoring—never mixing concerns. Violations: bug fix + cleanup, multiple features, refactoring + feature work."
name: "Atomic Commits & Single-Feature PRs"
excludeAgent: "coding-agent"
---

# Atomic Commits & Single-Feature PRs

Every commit and pull request must contain **exactly one logical unit of change**. This makes code review easier, history cleaner, and rollbacks safer.

## Core Rule: One Change Per PR

✅ **Allowed** — Single logical units:
- One bug fix (and minimal supporting changes to make it work)
- One feature implementation (start-to-finish for that feature)
- One refactoring of a specific component
- One test suite addition or fix
- One documentation update

❌ **Forbidden** — Mixed concerns:
- Bug fix + code cleanup in the same PR
- Multiple unrelated features in one PR
- Refactoring mixed with feature work
- Test fixes + implementation changes together
- Style/formatting changes + logic changes in the same commit

## Why Atomicity Matters

| Benefit | Impact |
|---------|--------|
| **Easier Review** | Reviewers focus on one concern—approval is clear |
| **Better Bisect** | When bugs appear, `git bisect` finds the exact commit |
| **Cleaner History** | Each commit tells a complete, focused story |
| **Safer Rollback** | Revert one change without unintended side effects |
| **Clearer Blame** | `git log` shows exactly what changed and why |

## How to Apply This

### Before Starting
- [ ] Identify the **single logical change** you're making
- [ ] If you have multiple ideas, create separate PRs for each
- [ ] Separate cleanup/refactoring into its own PR if discovered during implementation

### During Development
- [ ] Keep commits focused—one logical step per commit
- [ ] Don't add "while I'm here" cleanup unless it's part of the fix
- [ ] If you find code that needs refactoring, file an issue instead of bundling it

### Before Submitting PR
- [ ] PR title describes ONE change (e.g., "Fix login timeout bug", not "Fix login, improve UI, refactor auth")
- [ ] PR description explains the single concern and its impact
- [ ] Related but separate work gets its own PR

## Example: Splitting a Mixed PR

❌ **Bad PR**: "Improve login flow"
```
- Fix timeout bug when network is slow
- Refactor AuthService into separate files
- Update CSS for new button design
- Add missing unit tests
```

✅ **Good PRs** (split into atomic parts):
1. PR #101: "Fix login timeout on slow networks"
2. PR #102: "Refactor AuthService into separate modules"
3. PR #103: "Update login button styling"
4. PR #104: "Add unit tests for AuthService"

Each PR can be reviewed, bisected, and rolled back independently.

## No Exceptions

This applies to **all code changes** except when explicitly excluded by an agent instruction. When in doubt, split the PR.

---

**Remember**: Atomic commits make the entire codebase more maintainable. 
