# Development guardrails for LLM-assisted development

Because development will be driven substantially by an LLM agent, we adopt a defense-in-depth guardrail stack where each layer catches a different failure mode (hallucinated code, secret leakage, the agent weakening its own guardrails, and billable-infra runaway). The unifying principle: machine-enforce locally, re-enforce in CI, backstop with the platform, and require a human at every irreversible or sensitive step.

The stack:

1. **Local commit hooks — Vite+ native.** `vp config` sets `core.hooksPath=.vite-hooks/_` and installs a `pre-commit` that runs `vp staged` (format/lint/typecheck on staged files via the `staged:` block in `vite.config.ts`). Dispatchers for all hooks already exist; `commit-msg`/`pre-push` are added as user scripts in `.vite-hooks/`. A `prepare: vp config` script reinstalls hooks on fresh clone. (`VITE_GIT_HOOKS=0` opts out per environment.)
2. **Conventional commits.** `commitlint` on the local `commit-msg` hook, plus `amannn/action-semantic-pull-request` on PR titles in CI. Conventional commits are also mandated in AGENTS.md.
3. **Secret prevention.** `.gitignore` (`.dev.vars`, `.env*`, `.wrangler`, `node_modules`, `dist`, etc.) + `gitleaks` in pre-commit and CI + GitHub Push Protection / Secret Scanning. The LLM API key never lives in the repo.
4. **CI required checks.** `vp check` (format + lint + typecheck; warnings fail) + `vp test` + `vp build`, run via `voidzero-dev/setup-vp` + pnpm. PRs must be green and up-to-date before merge.
5. **Tests.** Domain invariants first (every generated surname ∈ the real-surname list; valid kanji+reading pairs; respects gender/tone), then API contract (`/generate`, rate limit 10/day, Turnstile), core units (phoneme/IPA/etymology/mapping), Preact component tests, and Playwright E2E against a preview deploy, with a global coverage threshold.
6. **Human approval gates.** Branch protection on `main` (no direct push), 1 required review, linear history, no force-push. `CODEOWNERS` mandates owner approval for Terraform, ADRs, `AGENTS.md`, CI workflows, `.vite-hooks`, and secret-related paths — so the agent cannot weaken its own guardrails unattended.
7. **Deploy / infra gate.** `terraform plan` is posted to the PR for human review; `terraform apply` and deploy run in CI on merge. Production deploys additionally require a manual approval via GitHub Environments required reviewers — the final backstop against agent runaway on billable public infra.
8. **Supply chain.** Renovate (grouped/scheduled updates; patch + devDeps auto-merge on green), `pnpm audit` in CI, and a `pnpm` `onlyBuiltDependencies` allowlist so only vetted packages run install scripts.
9. **AGENTS.md.** A `vp config`-generated base, extended with workflow mandates (`vp check` before commit, conventional commits, no secret commits, run tests) and explicit autonomous-vs-must-ask boundaries — deploy, `main` pushes, and edits to `AGENTS.md`/CI/`.vite-hooks`/`CODEOWNERS`/Terraform/ADRs require human confirmation, and the agent must never weaken its own guardrails and must consult `CONTEXT.md`/ADRs.

**Consequences**: higher setup cost and slower CI (E2E, coverage, plan reviews) — accepted as the price of safe autonomous agent development. The boundaries mean the agent can work freely inside the rules but hits a human gate at anything irreversible or self-modifying.
