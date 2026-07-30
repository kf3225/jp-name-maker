# Deploy on Cloudflare (Workers + Turnstile + Workers AI)

The app is a public, free, account-less web app whose core is an LLM-driven name generator (per ADR-0001). We will host it entirely on Cloudflare: Workers for the web app and API-exposable generation core, Turnstile for bot protection, and Workers AI for the LLM generation.

Cloudflare consolidates everything this product needs into one platform — edge hosting, an integrated LLM runtime (Workers AI), built-in bot protection (Turnstile), and trivial per-IP rate limiting — which directly serves the free + rate-limited + server-held-key access model. Hosting on a generic serverless platform (Vercel/Lambda) with an external LLM API and a separate captcha would split these concerns across providers and push LLM cost/latency off-platform.

**Consequences**: LLM quality and model choice are bounded by what Workers AI offers; if generation quality demands a specific external model, the generation layer can swap to an external API without changing the rest of the architecture (the validation layer and Workers/Turnstile boundary stay intact). Cold-start and runtime limits of Workers bound each generation request, so candidate count and prompt size must stay bounded per ADR's axis-structured default (~4–6 candidates).
