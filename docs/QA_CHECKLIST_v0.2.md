# QA Checklist — v0.2 Accounts and Sync

> Project: 小棋童围棋闯关  
> Version target: v0.2.0  
> Purpose: acceptance checklist for account-backed progress sync

---

# 1. Scope Confirmation

Before QA, confirm v0.2 scope:

- [ ] Supabase Auth added.
- [ ] Parent account flow added.
- [ ] Child profile flow added.
- [ ] Server-backed attempts/progress added.
- [ ] Wrong book works in server mode.
- [ ] Report works in server mode.
- [ ] localStorage import flow added.
- [ ] v0.1 local mode still works or transition behavior is clearly documented.

Confirm not included:

- [ ] No AI review.
- [ ] No AI opponent.
- [ ] No payment.
- [ ] No teacher/admin backend.
- [ ] No leaderboard.
- [ ] No 13x13 / 19x19 expansion.
- [ ] No multi-step problem engine.

---

# 2. Environment Check

- [ ] Node.js 20.19+ installed; Node.js 22 recommended.
- [ ] `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] `.env.local` contains `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] No service role key is present in client environment.
- [ ] `npm install` completes.
- [ ] `npm run build` passes.
- [ ] `npm run test` passes.

Docker validation is required only if dependency/build/Docker config changed or before release tag.

---

# 3. Database Schema Check

Confirm tables exist:

- [ ] `profiles`
- [ ] `child_profiles`
- [ ] `problem_attempts`
- [ ] `wrong_problems`
- [ ] `progress_summary`

Confirm constraints:

- [ ] attempt coordinates must be 0–8.
- [ ] `wrong_problems.status` must be `active`, `reviewing`, or `mastered`.
- [ ] star count cannot be negative.
- [ ] streak days cannot be negative.
- [ ] wrong count cannot be negative.

---

# 4. RLS Check

RLS must be enabled on:

- [ ] `profiles`
- [ ] `child_profiles`
- [ ] `problem_attempts`
- [ ] `wrong_problems`
- [ ] `progress_summary`

Parent A cannot access Parent B data:

- [ ] Parent A cannot select Parent B profile.
- [ ] Parent A cannot select Parent B child profile.
- [ ] Parent A cannot select Parent B attempts.
- [ ] Parent A cannot select Parent B wrong problems.
- [ ] Parent A cannot select Parent B summary.
- [ ] Parent A cannot insert rows for Parent B child profile.
- [ ] Parent A cannot update rows for Parent B child profile.

---

# 5. Auth Flow Check

- [ ] User can sign up.
- [ ] User can sign in.
- [ ] User can sign out.
- [ ] Session persists after refresh.
- [ ] Signed-out user sees local mode or clear sign-in prompt.
- [ ] Auth errors are understandable and not technical.
- [ ] No child email account is required.

---

# 6. Child Profile Check

- [ ] Signed-in parent can create a child profile.
- [ ] Child profile can use nickname instead of real name.
- [ ] Age range is optional.
- [ ] Go experience is optional.
- [ ] Parent can select active child profile.
- [ ] Refresh preserves selected child or asks clearly.
- [ ] Parent cannot access another parent's child profile.

---

# 7. Local Mode Regression Check

If v0.2 keeps local mode:

- [ ] Without login, home page still loads.
- [ ] Without login, daily practice still works locally.
- [ ] Without login, wrong book still works locally.
- [ ] Without login, report still works locally.
- [ ] Settings reset still clears local progress.
- [ ] No Supabase error blocks local mode.

If v0.2 requires login, this must be explicitly approved and documented before implementation.

---

# 8. Server Practice Flow Check

Signed in with active child profile:

- [ ] Start daily practice.
- [ ] Correct answer records attempt.
- [ ] Wrong answer records attempt.
- [ ] Used hint records `used_hint = true`.
- [ ] First correct problem gives +1 star once.
- [ ] Repeating same correct problem does not duplicate +1 star.
- [ ] Completing daily practice gives +5 once per day.
- [ ] Repeating daily practice same day does not duplicate +5.
- [ ] Refresh preserves server progress.

---

# 9. Server Wrong Book Check

- [ ] Wrong answer creates or updates wrong problem.
- [ ] Wrong problem appears in wrong book.
- [ ] Correct review changes `active → reviewing`.
- [ ] Second correct review changes `reviewing → mastered`.
- [ ] Mastered wrong problem disappears from active wrong book.
- [ ] Wrong answer after reviewing/mastered returns to `active`.
- [ ] `correct_review_count` resets to 0 after wrong answer.

---

# 10. Server Report Check

- [ ] Report loads from server progress.
- [ ] Attempted count matches server attempts.
- [ ] Accuracy matches server attempts.
- [ ] First-try accuracy is computed by first attempt per problem.
- [ ] Stars match `progress_summary`.
- [ ] Wrong count matches active/reviewing wrong problems.
- [ ] Strongest/weakest category still works.
- [ ] Empty state works for new child profile.

---

# 11. localStorage Import Check

Prepare local v0.1 progress first.

- [ ] Signed-in parent with child profile sees import prompt.
- [ ] Import prompt explains local progress will be uploaded.
- [ ] User can cancel import.
- [ ] Cancel import writes no server data.
- [ ] User can accept import.
- [ ] Attempts import to server.
- [ ] Wrong problems import to server.
- [ ] Stars import or merge according to migration rules.
- [ ] Completed IDs import or merge.
- [ ] Import marker is written after success.
- [ ] Refresh after import does not prompt again for same child.
- [ ] Local v0.1 progress is not deleted automatically.

---

# 12. Import Conflict Check

Server already has progress and local progress exists:

- [ ] Warning is shown before import.
- [ ] Attempts are not duplicated after repeated import attempt.
- [ ] Wrong problem status uses conservative merge.
- [ ] Active beats reviewing/mastered.
- [ ] Completed IDs are unioned.
- [ ] Mastered IDs do not override active/reviewing wrong status.
- [ ] Stars are not blindly double-added.

---

# 13. Import Failure Check

Simulate failure during import:

- [ ] User sees clear failure message.
- [ ] Import marker is not written if import incomplete.
- [ ] Local progress remains intact.
- [ ] Retry does not duplicate attempts if source hash exists.
- [ ] Retry eventually succeeds.

---

# 14. Privacy Check

- [ ] No real child name required.
- [ ] No exact birthdate required.
- [ ] No school/location required.
- [ ] No analytics added.
- [ ] No AI service receives attempt data.
- [ ] Parent account owns child data.
- [ ] Import prompt explains cloud upload.

---

# 15. UI / Mobile Check

- [ ] Login UI works on mobile width.
- [ ] Child profile UI works on mobile width.
- [ ] Import prompt fits mobile width.
- [ ] Daily practice remains usable on mobile.
- [ ] Wrong book remains usable on mobile.
- [ ] Report remains readable on mobile.
- [ ] No horizontal scroll on common phone viewport.

---

# 16. Regression Check

- [ ] Existing 36 problems still load.
- [ ] `validateAllProblems` still passes.
- [ ] `/demo` still does not pollute progress.
- [ ] Settings reset behavior is documented for local/server mode.
- [ ] No v0.1 feature is silently removed.

---

# 16.1 Network and Session Edge Cases

- [ ] If connection drops during practice, attempts are queued locally.
- [ ] After reconnect, queued attempts are sent to server.
- [ ] If Supabase session expires during practice, user sees clear message.
- [ ] After re-auth, server progress is restored without data loss.
- [ ] Concurrent devices with same child profile: both see consistent progress after sync.

---

# 17. Release Decision Template

```text
Release: v0.2.0
Date:
Tester:
Environment:
Supabase project:

Build: pass/fail
Tests: pass/fail
RLS check: pass/fail
Migration check: pass/fail
Local mode regression: pass/fail
Server mode regression: pass/fail
Mobile check: pass/fail

Blocking bugs:

Known limitations:

Decision:
[ ] Approved for v0.2.0 tag
[ ] Not approved — see notes

Notes:
```

---

# 18. v0.2 Completion Criteria

v0.2 is complete only when:

- account flow works;
- child profile works;
- server progress works;
- wrong book works in server mode;
- report works in server mode;
- local import is explicit and safe;
- RLS protects cross-user data;
- local mode behavior is either preserved or explicitly approved as changed;
- no AI/payment/teacher features are introduced.
