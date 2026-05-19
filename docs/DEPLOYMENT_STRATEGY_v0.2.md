# Deployment Strategy — v0.2

> Project: 小棋童围棋闯关  
> Version target: v0.2.0  
> Status: design constraint for implementation

---

# 1. Goal

v0.2 introduces account-backed progress sync, but the app must remain Docker-deployable and cloud-failure tolerant.

Primary deployment model for v0.2:

```text
Next.js App: Docker deployment
Supabase: Supabase Cloud managed backend
```

This means the application container is owned and deployed by us, while Auth and database services are provided by Supabase Cloud.

---

# 2. Default v0.2 Deployment Model

```text
+-----------------------------+
| Docker container             |
| weiqi-web                    |
| Next.js app                  |
| local anonymous mode         |
| Supabase client              |
+--------------+--------------+
               |
               | HTTPS
               v
+-----------------------------+
| Supabase Cloud               |
| Auth                          |
| Postgres                      |
| RLS policies                  |
| REST/RPC API                  |
+-----------------------------+
```

The Docker app must be able to start even if Supabase environment variables are missing.

---

# 3. Environment Variables

The Docker container may receive:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Rules:

- These variables are optional for local anonymous mode.
- Missing variables must not crash the app.
- If variables are missing, account/sync UI should be hidden, disabled, or show a clear setup message.
- Service role keys must never be passed to the browser container.
- Do not commit real Supabase keys.

---

# 4. Cloud-Failure Tolerance Requirements

v0.2 must remain usable if Supabase Cloud is unavailable.

Required behavior:

- Docker container starts without Supabase env.
- Home page works without Supabase env.
- Daily practice works in local mode without Supabase env.
- Wrong book works in local mode without Supabase env.
- Report works in local mode without Supabase env.
- Settings/reset local progress works without Supabase env.
- If Supabase network call fails, show a clear error.
- Never claim progress is synced unless the server write succeeded.
- Do not destroy local page state on server/network failure.
- Do not force login in v0.2.

---

# 5. Out of Scope for v0.2

Do not implement full Supabase self-hosting in v0.2.

Out of scope:

- Supabase self-hosted Docker Compose stack.
- Postgres backup automation.
- Supabase Auth SMTP configuration for production self-hosting.
- API Gateway/self-hosted Kong configuration.
- Supabase Realtime self-hosting.
- Supabase Storage self-hosting.
- Production SSL/domain automation for self-hosted Supabase.

If self-hosting is needed later, create a separate document:

```text
docs/SELF_HOSTING_v0.2.x.md
```

---

# 6. Why Not Self-Host Supabase Now?

Self-hosting Supabase adds infrastructure work that is not required to validate v0.2 learning sync.

It would require maintaining:

- Postgres;
- Auth service;
- SMTP/email flow;
- API gateway;
- JWT configuration;
- backups;
- upgrades;
- monitoring;
- HTTPS and domain configuration.

For v0.2, the product risk is not infrastructure ownership. The product risk is whether account sync improves the learning workflow.

---

# 7. Recommended Implementation Sequence

## v0.2.1a — Supabase Foundation Setup

- Add Supabase client dependency.
- Add `.env.example`.
- Add browser client helper.
- Add session helper/hook.
- Keep local mode working without env.
- Do not add login UI yet.

## v0.2.1b — Auth UI

- Add login/logout UI.
- Session restore.
- Keep local mode optional.

## v0.2.2 — Child Profile

- Add child profile table/migration.
- Add create/select child profile UI.

## v0.2.3 — Server Progress

- Save attempts/wrong book/summary to server mode.

## v0.2.4 — Local Import

- Explicit localStorage import flow.
- Idempotent import.

---

# 8. QA Requirements

Every v0.2 implementation phase must verify:

```bash
npm run build
npm run test
```

Docker validation is required before release/tag and when changing:

- Dockerfile;
- docker-compose files;
- package.json / package-lock.json;
- Next.js build config;
- deployment env behavior.

For v0.2.1a specifically, verify:

- app starts without Supabase env;
- account helpers fail gracefully without env;
- local anonymous mode still works;
- no login is required.

---

# 9. Acceptance for This Strategy

This deployment strategy is accepted when:

- `docs/SUPABASE_DESIGN_v0.2.md` references this deployment model;
- `docs/QA_CHECKLIST_v0.2.md` checks missing-env behavior;
- `docs/TASKS.md` scopes v0.2.1a accordingly;
- implementation does not introduce self-hosted Supabase in v0.2.
