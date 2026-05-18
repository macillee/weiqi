# Data Migration — v0.2

> Project: 小棋童围棋闯关  
> Version target: v0.2.0  
> Status: design only

---

# 1. Goal

v0.2 introduces account-backed progress without discarding v0.1 local progress.

Migration goal:

```text
Existing localStorage progress → optional user-confirmed import → Supabase-backed child progress
```

The migration must be explicit, reversible at the decision level, and safe against duplicate import.

---

# 2. Source Data

Current localStorage key:

```text
children-go-app:v0.1:progress
```

Current local progress includes:

- attempts;
- wrongProblems;
- stars;
- completedProblemIds;
- masteredProblemIds;
- lastPracticeDate;
- streakDays;
- achievements.

v0.2 should read the current local shape through existing `loadProgress()` instead of manually parsing localStorage in multiple places.

---

# 3. Target Data

Migration target tables:

- `problem_attempts`;
- `wrong_problems`;
- `progress_summary`.

Target owner:

```text
selected child_profile_id
```

No progress should be imported without an explicit child profile target.

---

# 4. Migration Trigger

Trigger migration only after:

1. parent signs in;
2. child profile exists or is selected;
3. app detects local v0.1 progress;
4. parent explicitly confirms import.

Do not automatically upload local data after sign-in.

---

# 5. Local Detection

Local progress should be considered importable if any of these are true:

```text
attempts.length > 0
wrongProblems.length > 0
stars > 0
completedProblemIds.length > 0
masteredProblemIds.length > 0
lastPracticeDate exists
```

If none are true, do not show import prompt.

---

# 6. Import Marker

Use a new local marker after successful import:

```text
children-go-app:v0.2:local-progress-imported
```

Suggested value:

```json
{
  "importedAt": "2026-05-18T00:00:00.000Z",
  "childProfileId": "uuid",
  "sourceKey": "children-go-app:v0.1:progress",
  "attemptCount": 0,
  "wrongProblemCount": 0
}
```

Rules:

- If marker exists for the same `childProfileId`, do not prompt import again by default.
- Provide an advanced/manual retry option later only if needed.
- Do not delete v0.1 local progress automatically after import.

---

# 7. Import UX

Recommended copy:

```text
发现这台设备上有本地学习进度。
要导入到当前孩子的云端进度吗？
```

Options:

```text
[导入本地进度]
[暂时不导入]
```

If server already has progress, show an additional warning:

```text
当前云端已经有学习记录。导入后会合并本地尝试记录，并更新星星、错题和报告。
```

v0.2 should avoid complex conflict UI. Keep choices clear.

---

# 8. Conflict Strategy

Minimum v0.2 strategy:

## Case A — Server empty, local exists

Action:

```text
Offer import.
If accepted, upload all local data.
```

## Case B — Server exists, local exists

Action:

```text
Offer import with warning.
If accepted, merge using idempotent rules.
```

## Case C — Server exists, local empty

Action:

```text
Do nothing.
Use server progress.
```

## Case D — Local already imported marker exists

Action:

```text
Do not prompt again.
Use server progress.
```

---

# 9. Idempotency Rules

Import must be safe if retried.

## Attempts

Current v0.1 attempts may not have stable unique IDs.

Recommended import identity:

```text
child_profile_id + problem_id + selected_x + selected_y + is_correct + used_hint + created_at
```

If `createdAt` exists in local attempts, preserve it.
If not, use import time but accept that duplicate prevention is weaker.

Recommended table improvement:

```sql
alter table public.problem_attempts
add column imported_from text,
add column imported_source_key text,
add column imported_source_hash text;
```

Then compute a deterministic source hash client-side during import.

Hash input:

```text
problemId|selectedX|selectedY|isCorrect|usedHint|createdAt
```

Unique index:

```sql
create unique index problem_attempts_import_hash_unique
on public.problem_attempts(child_profile_id, imported_source_hash)
where imported_source_hash is not null;
```

## Wrong problems

Use upsert by:

```text
(child_profile_id, problem_id)
```

Merge rule:

- `wrong_count`: max(server, local) or server + local if server empty;
- `correct_review_count`: use the more conservative value if status differs;
- `status`: more conservative status wins.

Status conservatism order:

```text
active > reviewing > mastered
```

If either local or server says active, result should be active.

## Progress summary

Merge rules:

- `stars`: max(server.stars, local.stars) for first implementation;
- `completed_problem_ids`: union;
- `mastered_problem_ids`: union, but remove any problem whose wrong status is active/reviewing;
- `last_practice_date`: max date;
- `streak_days`: max value;
- `achievements`: union.

Do not add stars blindly during import; imported stars should not trigger duplicate reward logic.

---

# 10. Import Algorithm

Pseudo-flow:

```text
load local progress
load server progress for child
if no importable local progress: exit
if import marker exists for child: exit
show import prompt
if declined: store declined state? optional
if accepted:
  begin import
  import attempts with source hashes
  upsert wrong problems
  merge progress summary
  write local import marker
  reload server progress
```

If Supabase transaction/RPC is available, prefer server-side RPC for consistency.

If using client-side multiple writes in v0.2 first pass:

- attempts insert with upsert/ignore duplicates;
- wrong problems upsert;
- progress summary upsert last;
- marker written only after all writes succeed.

---

# 11. Failure Handling

If import fails before marker is written:

```text
Show: 导入没有完成，请稍后重试。
Do not mark imported.
Do not delete local progress.
```

If some attempts were inserted but marker was not written:

- retry should not duplicate attempts if import hash is used;
- wrong problems and summary should be upserted again safely.

---

# 12. Do Not Delete Local Progress

v0.2 should not automatically delete v0.1 localStorage progress.

Reasons:

- rollback safety;
- user trust;
- import retry safety;
- debugging.

A later version may provide:

```text
Clear local progress after successful cloud sync
```

But it should require explicit confirmation.

---

# 13. Report Consistency

After import, `/report` in server mode should match or reasonably approximate local report.

Expected:

- attempted count same or greater;
- wrong count same or conservatively active;
- stars not less than local stars;
- completed IDs include local completed IDs;
- mastered wrong problems not shown unless made active again by merge.

---

# 14. Privacy and Consent

Import prompt must explain:

- local progress is on this device;
- importing sends progress to the account's cloud storage;
- this allows progress to be used on other devices;
- parent controls the account.

Do not import in the background.

---

# 15. QA Cases

Minimum migration QA:

1. no local progress → no prompt;
2. local progress, no server progress → import succeeds;
3. local progress, existing server progress → warning shown;
4. import cancelled → no server writes;
5. import succeeds → marker written;
6. refresh after import → no duplicate prompt;
7. retry after simulated failure → no duplicate attempts;
8. wrong problem active survives merge;
9. mastered local wrong problem stays mastered only if server does not say active/reviewing;
10. local progress remains in localStorage after import.

---

# 16. Completion Criteria

Migration design is ready only when:

- import trigger is reviewed;
- merge rules are reviewed;
- idempotency approach is reviewed;
- privacy copy is reviewed;
- QA checklist covers cancellation, retry, duplicate prevention, and RLS.
