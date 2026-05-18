# Roadmap — v0.2 Accounts and Sync

> Project: 小棋童围棋闯关  
> Version target: v0.2.0  
> Purpose: planning document only; do not implement during v0.1.3

---

# 1. Current State

v0.1.x is a local-first MVP.

Current system:

```text
Next.js app
9x9 SVG board
36 reviewed single-move problems
local JSON problem data
localStorage progress
wrong book
stars
learning report
settings/reset progress
Vitest core tests
```

Current storage:

```text
children-go-app:v0.1:progress
```

Current limitations:

- no login;
- no account;
- no database;
- no multi-device sync;
- no parent/child profile separation;
- no server-side backup;
- no teacher/admin workflow;
- no AI.

---

# 2. v0.2 Goal

v0.2 should move the product from a local-only learning app to an account-backed learning app.

Primary goal:

```text
Parent account → child profile → synced progress
```

v0.2 should still remain a focused learning product. It should not become a general Go platform.

---

# 3. v0.2 Non-Goals

Do not include in v0.2 unless explicitly approved:

- AI review;
- AI opponent;
- online Go games;
- teacher/classroom backend;
- payment;
- ranking/leaderboard;
- social features;
- real-time multiplayer;
- 19x19 full game engine;
- complex SGF editor.

---

# 4. Recommended Technology Direction

Recommended stack for v0.2:

```text
Supabase Auth
Supabase Postgres
Supabase Row Level Security
Next.js App Router
Client-side localStorage import path
```

Rationale:

- small team friendly;
- quick Auth setup;
- Postgres gives structured progress storage;
- RLS can protect per-user data;
- works well with local-first migration path.

This is only a planning recommendation. Implementation should start only after v0.1.3 playtest/polish.

---

# 5. Account Model

Recommended user model:

```text
Parent account
  └── Child profile(s)
        └── Progress
```

A parent account may have one or more child profiles.

Minimum v0.2 scope may support only one child profile per parent first, but the schema should not block multiple profiles later.

---

# 6. Suggested Tables

## 6.1 profiles

Stores authenticated user profile.

| Column | Type | Notes |
|---|---|---|
| id | uuid | references auth user |
| display_name | text | parent display name |
| created_at | timestamptz | server timestamp |
| updated_at | timestamptz | server timestamp |

## 6.2 child_profiles

Stores child learner profiles.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| parent_user_id | uuid | owner user id |
| display_name | text | child nickname; avoid requiring real name |
| age_range | text | optional, e.g. `6-8`, `9-10` |
| go_experience | text | optional, e.g. `about_1_year` |
| created_at | timestamptz | server timestamp |
| updated_at | timestamptz | server timestamp |

## 6.3 problem_attempts

Stores every attempt.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| child_profile_id | uuid | learner id |
| problem_id | text | e.g. `CAP-001` |
| selected_x | int | selected coordinate |
| selected_y | int | selected coordinate |
| is_correct | boolean | attempt correctness |
| used_hint | boolean | whether hint was used |
| time_spent_seconds | int | currently may be 0 |
| created_at | timestamptz | server timestamp |

## 6.4 wrong_problems

Stores wrong-book state.

| Column | Type | Notes |
|---|---|---|
| child_profile_id | uuid | learner id |
| problem_id | text | problem id |
| wrong_count | int | number of wrong attempts |
| correct_review_count | int | consecutive review correct count |
| status | text | `active`, `reviewing`, `mastered` |
| last_wrong_at | timestamptz | nullable |
| last_review_at | timestamptz | nullable |
| updated_at | timestamptz | server timestamp |

Composite key:

```text
(child_profile_id, problem_id)
```

## 6.5 progress_summary

Stores aggregate progress for fast display.

| Column | Type | Notes |
|---|---|---|
| child_profile_id | uuid | primary key |
| stars | int | total stars |
| streak_days | int | consecutive practice days |
| last_practice_date | date | for daily reward dedupe |
| completed_problem_ids | text[] | optional denormalized field |
| mastered_problem_ids | text[] | optional denormalized field |
| achievements | text[] | optional |
| updated_at | timestamptz | server timestamp |

Note: this table can also be derived from attempts/wrong_problems, but keeping it can simplify v0.2 UI.

---

# 7. localStorage Migration Strategy

v0.2 should not discard local progress.

Recommended flow:

```text
User signs in
→ App detects existing localStorage progress
→ App asks whether to import local progress
→ If accepted, upload attempts/wrongProblems/stars to database
→ Mark local progress as imported
→ Continue using server-backed progress
```

Do not silently upload local progress without user action.

Suggested local marker:

```text
children-go-app:v0.2:local-progress-imported
```

---

# 8. Data Conflict Strategy

Minimum v0.2 conflict strategy:

- If server has no progress and local progress exists: offer import.
- If server has progress and local progress exists: show clear choice.
- If user declines import: keep server progress as source of truth.
- Do not merge aggressively without explicit rules.

Possible choices shown to user:

```text
1. 使用云端进度
2. 导入这台设备上的进度
3. 暂时不处理
```

---

# 9. RLS Principles

Row Level Security should ensure:

- parent can read/write only their own profile;
- parent can read/write only child profiles they own;
- parent can read/write progress only for their own children;
- no public access to child data;
- no cross-parent access.

Do not store unnecessary personal data.

Children should not need email accounts in v0.2.

---

# 10. Privacy Principles

v0.2 should remain privacy-light.

Avoid collecting:

- real child name;
- precise birthdate;
- school name;
- location;
- unnecessary behavioral analytics.

Allowed minimal data:

- child nickname;
- optional age range;
- optional Go experience range;
- progress and attempts.

---

# 11. v0.2 Feature Scope

Recommended v0.2 implementation order:

## Phase 1 — Auth Foundation

- Supabase project setup.
- Environment variables.
- Login/logout.
- Parent profile.
- Basic auth UI.

## Phase 2 — Child Profile

- Create child profile.
- Select active child.
- Store selected child locally.

## Phase 3 — Server Progress

- Save attempts to database.
- Save wrong problem state.
- Save stars and practice streak.
- Load report from server data.

## Phase 4 — Import Local Progress

- Detect v0.1 localStorage progress.
- Offer import.
- Upload attempts/wrongProblems/progress summary.
- Avoid duplicate imports.

## Phase 5 — QA and Migration Docs

- Add migration test checklist.
- Add RLS test checklist.
- Add backup/rollback notes.

---

# 12. Required v0.2 Documents Before Implementation

Before coding v0.2, create:

```text
docs/SUPABASE_DESIGN_v0.2.md
docs/DATA_MIGRATION_v0.2.md
docs/QA_CHECKLIST_v0.2.md
```

These should be reviewed before implementation begins.

---

# 13. v0.2 Acceptance Criteria

v0.2 is complete only when:

- parent can sign up / sign in / sign out;
- parent can create or select a child profile;
- progress syncs to database;
- localStorage progress can be imported intentionally;
- wrong book works with server progress;
- learning report works with server progress;
- RLS prevents cross-user access;
- v0.1 local-only flow remains understandable if user is not logged in, or login requirement is clearly communicated;
- no AI/payment/teacher features are introduced.

---

# 14. Open Decisions

These should be resolved before implementation:

| Decision | Options | Recommendation |
|---|---|---|
| Is login required or optional? | required / optional | optional during v0.2 transition |
| Number of child profiles | one / many | schema supports many, UI may start with one |
| Offline support | full / partial / none | partial: local cache only |
| local progress import | automatic / manual | manual confirmation |
| report source | aggregate table / derived from attempts | start with aggregate summary plus attempts |

---

# 15. Implementation Warning

Do not begin v0.2 implementation until v0.1.3 playtest/polish has been reviewed.

The product needs feedback from the current 36-problem local version before adding account complexity.
