# Simple Agent Workflow

> Goal: keep automation lightweight for this small project.

This workflow uses ChatGPT to create issues, opencode to implement them on a schedule, and ChatGPT to accept or reject the resulting PR.

## Flow

```text
ChatGPT creates an issue
-> opencode picks up the issue on a schedule
-> opencode implements and opens a PR
-> ChatGPT checks the PR against the issue
-> human merges
```

## Labels

Use only these workflow labels:

```text
todo
doing
review
```

- `todo`: the issue is ready for opencode.
- `doing`: opencode has picked up the issue.
- `review`: a PR is open and ready for ChatGPT acceptance.

If an issue or PR needs human judgment, leave a comment explaining the blocker instead of adding more workflow states.

## Issue Format

ChatGPT should create small issues with this format:

```md
## Task

One short paragraph describing the change.

## Acceptance

- Concrete acceptance point 1.
- Concrete acceptance point 2.

## Do Not

- Do not add unrelated features.
- Do not change unrelated files.
```

Good issues are narrow enough for one small PR. If the task needs multiple unrelated changes, split it into multiple issues.

## ChatGPT Issue Rules

Before creating an issue, ChatGPT must check:

- The task matches `docs/TASKS.md`.
- The task does not violate `docs/PROJECT_SPEC.md`.
- The issue has clear acceptance criteria.
- The `Do Not` section protects the project from scope creep.

ChatGPT should add the `todo` label only when the issue is ready for opencode.

## opencode Scheduled Job

opencode should run on a simple schedule, such as once per hour.

Each run should:

1. Find the oldest open issue with the `todo` label.
2. Change the label from `todo` to `doing`.
3. Create a branch named `opencode/issue-<number>-<short-title>`.
4. Implement only the issue scope.
5. Run validation:

```bash
npm run build
npm run test
```

6. Open a PR that includes `Closes #<issue-number>`.
7. Move the issue or PR to the `review` label.

If implementation fails, opencode should leave a comment with the failure reason and stop. It should not silently expand scope.

## PR Rules

Each PR should include:

```md
## Summary

## Acceptance Mapping

## Validation
```

The acceptance mapping should show how each issue acceptance point was handled.

## ChatGPT Acceptance

ChatGPT checks only three things:

1. The issue acceptance criteria are satisfied.
2. The PR does not violate the issue `Do Not` section.
3. The required validation passed.

Acceptance output should be one of:

```text
PASS
```

```text
FAIL
- Required fix 1.
- Required fix 2.
```

If the decision needs product or technical judgment that is not clear from the issue, ChatGPT should write:

```text
NEEDS HUMAN
- Reason.
```

## Project Guardrails

All agent work must still follow:

- `docs/PROJECT_SPEC.md`
- `docs/DEVELOPMENT_GUIDE.md`
- `docs/TASKS.md`
- `docs/QUALITY_CHECKLIST.md`

For this project, small PRs are preferred over broad automation. Human merge remains the final gate.

## Workflow Smoke Test

This section verifies the automated agent workflow from issue pickup to PR creation.

A narrow documentation-only issue (like adding this section) can be used to verify:

1. **Issue Pickup**: opencode detects the `todo` label and picks up the issue.
2. **PR Creation**: opencode creates a branch, implements the change, and opens a PR.
3. **ChatGPT Acceptance**: ChatGPT reviews the PR against the issue acceptance criteria.

This smoke test confirms the workflow is functional without modifying application code or dependencies.
