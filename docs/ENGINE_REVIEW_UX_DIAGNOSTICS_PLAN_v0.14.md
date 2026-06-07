# Engine-Assisted Review UX Evaluation / Local Engine Diagnostics Plan — v0.14

## 1. Goal and Constraints

### Goal

Evaluate the current engine-assisted review (v0.13.0d) before building more engine UX. Determine whether the integration is useful, understandable, stable, and safe for the target learner.

### Target learner

- Child with about one year of Go study
- Comfortable with Chinese board coordinate labels (一–九)
- Familiar with rule/template coach feedback ("吃子", "连接", etc.)

### Constraints

- Personal/local-first deployment — runs locally for one child
- KataGo is optional and disabled by default (`KATAGO_ENABLED=false`)
- Rule/template coach remains the fallback
- No external AI API
- No free-form chat
- No raw winrate/scoreLead numbers shown to the child
- v0.14 should avoid feature creep until QA evidence exists

### Non-goals

- No diagnostics UI implementation
- No settings page changes
- No logging or telemetry code
- No engine adapter behavior changes
- No KataGo binary/model/config changes
- No package, Docker, CI, or dependency changes
- No problem data, schema, or SQL changes

---

## 2. UX Evaluation Questions

Answer these questions before further engine work:

| # | Question |
|---|---|
| 1 | Does the child notice and understand `本地引擎辅助` label in FeedbackDialog? |
| 2 | Does the engine-assisted message improve comprehension compared with rule/template only? |
| 3 | Does immediate rule/template feedback plus later silent engine upgrade feel confusing? |
| 4 | Does the child continue practice smoothly when engine is disabled or unavailable? |
| 5 | Does the feedback remain short, friendly, and actionable (≤150 chars)? |
| 6 | Are engine-assisted messages too generic or repetitive? |
| 7 | Does the engine ever disagree with authored answers in confusing ways? |
| 8 | Are timeouts or slow responses visible to the child? |
| 9 | Does the child retry faster or slower with engine-assisted review? |
| 10 | Does the child ask what the `本地引擎辅助` label means? |

---

## 3. Manual Observation Protocol

### Recommended setup

Run **three short practice sessions** (5–10 problems each) with different engine states:

| Session | Engine state | Prep |
|---|---|---|
| A | Engine disabled (`KATAGO_ENABLED=false`) | No env change; this is the default |
| B | Engine unavailable (set `KATAGO_BIN_PATH` to invalid path) | Set env, restart |
| C | Engine enabled (local KataGo configured) | Install KataGo, set env, restart |

### What to observe

For each wrong answer:

- Time to recover (seconds between wrong-answer feedback and next click)
- Whether the child retries immediately or pauses to read feedback
- Whether the child looks at the `本地引擎辅助` tag or mentions it
- Whether feedback helps identify the concept
- Whether stale/old messages appear after navigating away and back
- Whether any loading delay, flicker, or confusion occurs

### Notes template

```
Session: [A / B / C]
Problem ID: [e.g. CAP-001]
Wrong move: (x, y)
Feedback shown: [rule-template text / engine-assisted text]
Engine available: [yes / no / error]
Observation: [free-form notes]
Child reaction: [read carefully / clicked through / asked question / seemed confused]
```

### Key rule

Do not require telemetry or analytics. All observation is manual by the parent.

---

## 4. Local Diagnostics Needs

Define what a future local diagnostics capability should answer — without implementing it yet.

### Config status

| Status | Meaning |
|---|---|
| `disabled` | `KATAGO_ENABLED=false` or env vars not set |
| `missing-binary` | `KATAGO_BIN_PATH` does not point to an executable file |
| `missing-model` | `KATAGO_MODEL_PATH` does not point to a valid weights file |
| `missing-config` | `KATAGO_CONFIG_PATH` not set (but binary + model are OK; uses defaults) |
| `available` | All required paths exist and engine responds |
| `error` | Binary exists but returns unexpected error |

### Last analysis status

| Status | Meaning |
|---|---|
| `success` | Engine returned valid `EngineReviewSignal` |
| `timeout` | Engine did not respond within `KATAGO_TIMEOUT_MS` |
| `malformed` | Engine output could not be parsed |
| `error` | Engine process exited with non-zero code or unexpected error |
| `unavailable` | Engine not available at request time |

### Last latency bucket

- `<1s`
- `1–3s`
- `3–5s`
- `>5s` (may indicate impending timeout)

### Additional signals

- Was fallback used? (yes/no)
- Was engine signal confidence `low / medium / high`?
- Did engine agree with authored answer? (yes / no / null if unavailable)

### Parent/developer scope only

Diagnostics are for the parent or developer, **never shown to the child during practice**. They answer "is my engine working?" and "is the engine producing useful signals?".

---

## 5. Privacy and Safety Constraints

- No child name, profile, or progress data is sent to engine diagnostics
- No external network calls are made
- No persistent transcripts by default
- No raw engine metrics are exposed to the child
- No analytics backend
- No Supabase dependency for diagnostics
- Diagnostics must work in local anonymous mode

---

## 6. Candidate Implementation Options for Later Slices

Evaluate options. **None are implemented in v0.14.0a.**

### Option 1: Docs-only QA checklist extension (simplest)

- Continue manual observation with a structured checklist
- No code changes
- Benefit: zero risk, zero maintenance
- Risk: no automated insight, relies on parent diligence

### Option 2: Developer console logging behind dev flag (server/local-only)

- Log engine availability and analysis results to server-side console when `ENGINE_DIAGNOSTICS_DEV_LOG=true`
- Must be server-only / local-only — **not** `NEXT_PUBLIC_*` (public client env flags weaken the child-facing boundary)
- Must avoid child-facing noise
- Useful for local debugging
- Risk: log output is ephemeral, no retained history
- If client-side logging is ever proposed later, it must be explicitly justified and gated separately

### Option 3: Parent-facing local diagnostics panel

- Small optional route or card on settings page
- Shows engine config status, last analysis result, latency bucket
- No child profile or progress data
- Benefit: immediate visibility for the parent
- Risk: scope creep into settings UI, child may see it

### Option 4: Server-side diagnostics helper (no UI)

- Server-only function that summarizes availability and last analysis result
- Could be called from dev tools or test helper
- Must not require API routes unless justified
- Benefit: programmatic access for tests and debugging
- Risk: adds abstraction without proven need

### Option 5: No diagnostics UI yet

- Use tests (engine-adapter.test.ts) and manual QA first
- Benefit: zero scope, zero maintenance
- Risk: parent has no way to verify engine is working without checking logs

### Recommended approach for v0.14

Start with **Option 1** (docs-only checklist) and **Option 2** (dev console logging) — both are low cost and provide sufficient information for the parent/developer in a local deployment. Options 3 and 4 are deferred to v0.14.c/d if manual observation reveals ambiguity.

---

## 7. Recommended v0.14 Slice Plan

### v0.14.0a — UX Evaluation / Diagnostics Plan (this task, docs-only)

- Planning document defining evaluation criteria, observation protocol, diagnostics needs, and slice plan
- No implementation

### v0.14.0b — Manual UX Evaluation Notes / QA Checklist Extension (docs-only)

- Structured observation checklist based on v0.14.0a protocol
- Updated QA checklist for engine-assisted review scenarios
- No diagnostics UI

### v0.14.0c — Local Engine Diagnostics Contract (docs-only)

- Define the TypeScript diagnostics data shape and access patterns
- No implementation

### v0.14.0d — Optional Developer Diagnostics Helper (local-only / server-only)

- Implement `getEngineDiagnostics()` — a server-only function that reads config and returns availability + last analysis summary
- Console-level logging behind dev flag
- No UI

### v0.14.0e — Stabilization / Release Notes

- QA pass, release notes for v0.14 series

### If evaluation reveals blocking issues

If v0.14.0b observation reveals that engine-assisted review confuses the child or blocks the feedback flow, the remaining slices should be paused and v0.14.0e should ship a recommendation to revert or hide the engine-assisted review behind a stronger gate.

---

## 8. Next Task Definition

### v0.14.0b — Manual UX Evaluation Notes / QA Checklist Extension

**Goal**: Create a structured observation checklist and extend the QA checklist with engine-assisted review scenarios for manual evaluation. Docs-only.

**Allowed files**:
- `docs/UX_OBSERVATION_CHECKLIST_v0.14.md` — observation notes template and protocol
- `docs/QA_CHECKLIST_v0.13.md` — extend with engine-assisted review scenarios (if appropriate)
- `docs/TASKS.md` — mark v0.14.0b delivered, queue v0.14.0c

**Non-goals**:
- No diagnostics UI
- No settings page changes
- No logging or telemetry
- No engine adapter behavior changes
- No code changes of any kind

**Acceptance criteria**:
- Structured observation checklist exists with session setup instructions, observation fields, and notes template
- Checklist covers three engine states: disabled, unavailable, enabled
- Checklist explicitly states no telemetry or analytics required
- No runtime code is modified
- No diagnostics are implemented
