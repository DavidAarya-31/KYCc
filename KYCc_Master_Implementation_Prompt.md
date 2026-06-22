# KYCc — Master Implementation Prompt

## How to use this

Paste this entire document to a coding agent that has actual access to the KYCc repository (Claude Code, Cursor, etc.) — not just the documentation. Work through the phases **in strict order**. After each phase: run `npm run build` and `npm run lint`, confirm the app still boots, and summarize what changed before moving to the next phase. Do not jump ahead to AI features while Phase 0/1 bugs are unresolved — a broken foundation makes every later feature harder to debug.

---

## Context

KYCc is a React 18 + TypeScript + Vite app with Supabase (Postgres + Auth + RLS) as the backend, fully client-side (no existing server). It tracks credit card milestone progress and personal budgets/transactions. Full architecture is documented in `project.md` in this repo — read it, but verify everything against actual source before changing code.

---

## AI provider strategy — free APIs only (Gemini / Ollama)

This project uses free AI access, not a paid API. There are two real options with genuinely different trade-offs — pick one as primary, and optionally support both behind one interface.

### Option A — Google Gemini API (free tier, cloud-hosted)
- No credit card required to start. The practical free-tier models support image input (vision). I'd recommend defaulting to Gemini 2.5 Flash or 2.5 Flash-Lite — Flash-Lite currently has the most generous free daily request allowance of the three free-tier models, based on my research.
- I'm not fully certain of the exact current numbers — Google cut free-tier quotas significantly in December 2025, and limits are described by third-party sources as roughly single digits to ~15 requests/minute and a few hundred to ~1,000 requests/day depending on model. **Verify the live numbers at `ai.google.dev/gemini-api/docs/rate-limits` before relying on them** — this is exactly the kind of detail that changes without much notice.
- Google's stated policy is that free-tier prompts/responses may be used to improve their models. Worth being deliberate about what data you send through it, even for a demo/interview project handling financial data.
- Still requires a server-side proxy — the API key must never ship in the browser bundle, free tier or not.

### Option B — Ollama (fully local, self-hosted, no API rate limits)
- For the OCR work in Phase 2, you need a **vision-capable** local model — plain text models like `llama3.1` or `mistral` cannot read images. Based on current model guides, `qwen2.5vl` is regarded as the strongest open option specifically for text-heavy/structured images like receipts and statements (better than older LLaVA-based models for this use case); `llama3.2-vision` and the lightweight `moondream` are alternatives if hardware is constrained.
- **Important architectural difference from Gemini:** Ollama is a server process *you* run (default `http://localhost:11434`), not a cloud API. It cannot be called from a Supabase Edge Function the way Gemini can, because Edge Functions run on Deno Deploy's infrastructure, not your machine. For local development this is simple — call it directly. For a deployed build a recruiter can actually open, Ollama would need to run on a server you control (a VPS, a home server with a tunnel, etc.). Decide and document this trade-off now rather than discovering it at deploy time.

### Recommended approach
Build one small abstraction — a single `callVisionModel()` / `callLLM()` function with a provider switch (env var, e.g. `AI_PROVIDER=gemini|ollama`) — so the rest of the app never cares which backend answered. This is also a good interview talking point: a provider-agnostic AI layer that swaps between a free cloud API and a local model. Suggested split: Gemini for anything you deploy/demo publicly (reachable from anywhere, but rate-limited), Ollama for local development and unlimited iteration without burning quota.

---

## Phase 0 — Audit only (make no code changes yet)

The cycle-reset bug description below is a **hypothesis**, not a confirmed diagnosis — it was inferred from documentation, not from reading the real source. Confirm or disprove it first.

Read: `src/utils/cycles.ts`, `src/pages/Cards.tsx`, `src/pages/CardDetail.tsx`, `src/components/CardTile.tsx`, `src/components/DashboardSummary.tsx`, `src/components/CycleSummary.tsx`, `src/components/MonthlySpendTable.tsx`.

Check specifically:
1. Does `getAnniversaryCycle()`'s returned `months` array encode both month **and year** (`YYYY-MM`), or only the month number? If only the month, any query filtering `monthly_spends` by month alone will pull in spend from every year that ever had that month — so cycle totals never truly reset.
2. Does the Supabase query against `monthly_spends` filter on both `month` AND `year` columns, or just `month`?
3. Is cycle total computed fresh on every mount/render, or cached in component state with no dependency on the current date — meaning a card viewed right before a cycle rollover keeps showing stale numbers?
4. Does the year-rollover math in `getAnniversaryCycle` work correctly for **every** possible anniversary month (1–12), including edge cases crossing the Dec→Jan boundary — not just the common case?

Report findings before starting Phase 1.

---

## Phase 1 — Fix existing functional bugs

- [ ] **Cycle reset/year bug** — fix the actual root cause identified in Phase 0. Acceptance: a card's current-cycle spend and milestone progress visibly drop to ₹0 the day the new cycle starts, and only ever sum `monthly_spends` rows matching the correct month **and** year.
- [ ] **`CycleSummary` prop mismatch** — `CardDetail.tsx` passes `{ milestone, spent, cycleEndMonth }`; `CycleSummary.tsx` expects `{ card, spent, cycle, remaining, progress, isUrgent, endDate }`. Pick one contract and align both sides.
- [ ] **Dashboard route mismatch** — desktop nav links to `/dashboard`; router only defines `/`. Fix the link (or add the route) — pick one source of truth.
- [ ] **CSV import mapping** — the mapping object shape and how preview values are read appear inconsistent. Verify with a real CSV and fix.
- [ ] **Finance table typing** — add `budgets`, `categories`, `budget_categories`, `transactions` to the `Database` type in `src/lib/supabase.ts` so finance helpers stop relying on `any`.
- [ ] **New-user default categories** — currently seeded only at migration time. Add a Postgres trigger on new user creation, or onboarding logic in the sign-up flow, so every new user gets default categories automatically.
- [ ] Run `npm run build && npm run lint` — zero errors before continuing to Phase 2.

---

## Phase 2 — Replace OCR import with AI-based extraction

Goal: extract **every** transaction present in an image, correctly mapped field-by-field — not a single guessed amount.

- [ ] **Add the `callVisionModel()` abstraction** — implement the provider switch described above.
  - *Gemini path:* a Supabase Edge Function (Deno) that accepts a base64 image, calls the Gemini API with image content blocks, and keeps the API key only in the Edge Function's environment — never in client code.
  - *Ollama path:* a small proxy (or direct call during local dev) to `http://localhost:11434/api/chat`, passing the image in the `images` field, using a vision model such as `qwen2.5vl` or `llama3.2-vision`. No API key needed, but document where Ollama needs to run for non-local use.
- [ ] **Force structured output** — system prompt instructs the model to return *only* a JSON array, one object per transaction detected, with fields: `date` (ISO), `amount` (decimal rupees), `description`, `suggested_category` (must be one of the user's real category names, passed into the prompt), `type` (`expense` | `income`), `confidence` (`high` | `medium` | `low`). No prose outside the JSON.
- [ ] **Handle both single receipts and multi-line statements** — explicitly instruct the model to return multiple objects when the image shows a statement or itemized bill, not merge everything into one total.
- [ ] **Category mapping** — match `suggested_category` against the real `categories` table (already available via `BudgetContext`) to resolve a `category_id`; fall back to `Other` on no confident match.
- [ ] **Payment method / card mapping** — if the import flow already has a card selected (e.g. importing a specific card's statement), set `payment_method: 'credit_card'` and that `card_id` directly rather than having the model guess it.
- [ ] **Review-before-import UI** — reuse the existing CSV-import preview pattern: render every extracted transaction as an editable row (date, amount, description, category dropdown, type, payment method, include/exclude checkbox). Visually flag `low`-confidence rows. Nothing writes to the DB until the user confirms.
- [ ] **Unit conversion** — multiply extracted rupee amounts by 100 before insert, matching the existing integer-cents/paise convention.
- [ ] **Demote Tesseract.js** — keep it only as an optional offline fallback if neither Gemini nor Ollama is reachable (e.g. no API key configured and Ollama not running); otherwise remove it from the primary path.
- [ ] Acceptance: uploading a multi-item receipt or a statement screenshot produces multiple correctly field-mapped rows in the review table, each editable before commit.

---

## Phase 3 — Core AI features (independently shippable, build in this order)

> Design every feature below to tolerate the free-tier ceiling: debounce/cache calls, avoid firing an AI request on every keystroke or every transaction save by default, and handle 429s with backoff and a clear "try again" state instead of a silent failure. If using Ollama, this constraint mostly disappears (only your hardware limits you).

- [ ] **Auto-categorizer** — LLM call on transaction create that suggests a `category_id` from the user's real categories. Consider making this on-demand (a button) rather than automatic-on-every-save if you're on Gemini's free tier, to conserve daily quota.
- [ ] **Smart card recommender** — suggests which linked credit card to use for a new transaction, based on remaining milestone gap and billing cycle.
- [ ] **"Ask your finances" (NL2SQL)** — translates a plain-English question into a *scoped* query against the signed-in user's own data only. Use parameterized queries or a constrained query-builder the model fills in — never raw string-concatenated SQL, to avoid injection risk.
- [ ] **Spending anomaly detection** — statistical detection (e.g. z-score against the user's own historical category averages) combined with an LLM-generated plain-language explanation of the anomaly.
- [ ] **Conversational financial advisor** — chat interface grounded in the user's real budgets, transactions, and milestone data as retrieved context.

---

## Phase 4 — Agentic AI (attempt last)

> Agent loops call the LLM multiple times per run (one per reasoning step or tool call), which burns through a low daily request cap fast on Gemini's free tier. Cap the maximum tool-call iterations per agent run, and prefer Ollama for iterating on agent logic during development.

- [ ] **Budget optimizer agent** — an agent loop that reads current budgets/transactions via tool calls, detects overspend, and *proposes* a rebalancing plan. It must never auto-apply changes without explicit user confirmation.
- [ ] **Multi-agent planner** — separate Budget, Milestone, and Savings agents coordinated by an orchestrator, producing one combined recommendation for the user to review.

---

## Non-negotiable constraints (apply throughout all phases)

- Preserve Supabase RLS on every table and Edge Function — no cross-user data leakage.
- No LLM/API keys in client-side code, ever (Gemini key; not applicable to local Ollama, but keep the same proxy pattern for consistency).
- No agent may write financial data without an explicit human confirmation step.
- TypeScript strict mode stays green at the end of every phase.
- Keep the existing integer-cents/paise money convention everywhere.
- Every AI call path goes through the `callLLM()` / `callVisionModel()` abstraction — never hardcode a specific provider's SDK call directly inside a component.
- Handle rate-limit errors (HTTP 429 from Gemini) gracefully with backoff and a visible "try again" state — do not let the UI hang or fail silently.

---

## Execution instructions for the agent

Work phase by phase, in order. After each phase: build, lint, summarize what changed and why, and wait for confirmation before starting the next phase. If the real root cause found in Phase 0 differs from the hypothesis stated there, fix the actual cause and explicitly note the discrepancy rather than forcing the documented assumption.
