# Infrastructure fully managed by Terraform

All Cloudflare infrastructure for this app — Workers, routes, Turnstile widget/site key, KV namespaces and rate-limit stores, Workers AI bindings, and secrets — is provisioned and managed exclusively via Terraform (Cloudflare provider). Manual changes in the Cloudflare dashboard are not permitted.

Manual click-ops is the rejected alternative: it causes config drift between environments, is not reviewable, and cannot reproduce or recover an environment. Terraform makes every infra change a reviewed, reproducible, version-controlled artifact.

**Consequences**: every infra change goes through `terraform plan/apply`; the dashboard becomes read-only to avoid drift. Terraform state is stored remotely with locking. Secrets are injected as sensitive variables and materialised as Workers secrets, never committed. Workers application code is still deployed via Wrangler, but its *bindings and resources* are owned by Terraform.
