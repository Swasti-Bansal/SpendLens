# SpendLens

SpendLens is a free AI spend audit tool for startup founders and engineering managers. Input your AI tool subscriptions, get an instant breakdown of where you're overspending, what to switch or downgrade, and exactly how much you could save — per month and per year.

Built in 7 days as a working product, not a prototype. No login required. Email is captured after value is shown, never before.

**Live URL:** [https://spendlens-pink.vercel.app](https://spendlens-pink.vercel.app)

---

## Screenshots

| Form Page | Results — High Savings | Results — Optimal | Results — Recommendations |
|-----------|----------------------|-------------------|
| ![Landing Page](./src/assets/LandingPage.png) | ![Audit Form](./src/assets/AuditForm.png) | ![Results Overview](./src/assets/ResultPage1.png)|![Results Recommendations](./src/assets/ResultPage2.png)|


---

## Quick Start

### Run locally

```bash
git clone https://github.com/Swasti-Bansal/SpendLens.git
cd SpendLens
npm install
cp .env.example .env   # fill in your keys — see section below
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

Create a `.env` file at the project root (see `.env.example`):

```
VITE_ANTHROPIC_API_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_RESEND_API_KEY=
```

**Getting keys:**
- Anthropic: [console.anthropic.com](https://console.anthropic.com) → API Keys. The app falls back to a templated summary if the key is missing or the call fails.
- Firebase: Create a project at [console.firebase.google.com](https://console.firebase.google.com) → Add Web App → copy the config object.

### Run tests

```bash
npm test
```

All 5 audit engine tests run via Vitest. Output shows pass/fail per rule.

### Build for production

```bash
npm run build
# dist/ folder is ready — deploy to Vercel, Netlify, or Cloudflare Pages
```

The repo is connected to Vercel — every push to `main` auto-deploys.

---

## How it works

```
User fills form (tools + plans + seats + team size + use case)
        ↓
runAudit() — pure JS rules engine, no AI
        ↓
Audit result saved to localStorage with a UUID
        ↓
Navigate to /results/:auditId
        ↓
generateSummary() — Anthropic API call (fallback on failure)
        ↓
Results page renders: savings hero, per-tool breakdown, AI summary
        ↓
Email submitted → saveLead() → Firebase Firestore
```

---

## Decisions

Five non-trivial trade-offs made during the build:

**1. Hardcoded rules for audit logic, not AI**

The audit engine uses deterministic rules — plan comparisons, seat-count checks, use-case matching — rather than asking an LLM to evaluate spend. This is deliberate. Every recommendation traces to a specific number: "Copilot Business at 2 seats costs $38/mo; Individual costs $20/mo; switch saves $18." A finance person can verify that in 10 seconds. An LLM-generated recommendation can't be verified the same way, and trust is the product's entire value. AI is used only for the natural-language summary, where precise auditability matters less than readability.

**2. localStorage for audit state, not a database**

Audit results are stored in localStorage keyed by a UUID. The trade-off: shared URLs only work cross-device if the recipient has the same localStorage entry, which they won't. This is a known limitation documented in ARCHITECTURE.md. The decision was to ship a working shareable URL feature immediately rather than block on building a read API. At scale this moves to Firebase with a public-read `/audits/:id` endpoint.

**3. React + Vite instead of Next.js**

Next.js would have given SSR for free, which matters for Open Graph previews — crawlers can't execute React-rendered meta tags. The workaround (`react-helmet`) works for human-shared links clicked directly but won't generate rich previews when a bot crawls the URL. The trade-off was accepted because the viral loop depends on humans copying and pasting links, not on Twitter's card bot. A production launch would migrate to Next.js App Router.

**4. Firebase Firestore over a custom backend**

Firestore requires zero server infrastructure, deploys in minutes, and the free tier comfortably handles this volume. The trade-off is limited ad-hoc querying — building a leads dashboard later would require exporting data or adding a Cloud Function. Supabase + Postgres would be more portable. Firestore was chosen to eliminate deployment complexity within the 7-day window.

**5. Plain JavaScript over TypeScript**

TypeScript would improve the audit engine's type safety — the `result` object shape is complex enough that types would catch mistakes the tests might miss. The trade-off was setup time vs. benefit at this codebase size. The mitigation is 5 unit tests covering the engine's core paths. Week 2 priority would be a full TypeScript migration, starting with `auditEngine.ts` and `pricingData.ts`.

---

## Project structure

```
src/
├── data/
│   └── pricingData.js        # All tool plans + prices — single source of truth
├── engine/
│   ├── auditEngine.js        # Pure audit logic — no side effects
│   └── auditEngine.test.js   # 5 Vitest unit tests
├── lib/
│   ├── firebase.js           # Firestore init
│   ├── generateSummary.js    # Anthropic API call + fallback
│   └── saveLead.js           # Lead storage
└── pages/
    ├── FormPage.jsx           # Tool input form
    └── ResultsPage.jsx        # Audit results + email capture
```

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite | Fast dev server, simple config, no SSR complexity |
| Routing | React Router v6 | Standard for React SPAs |
| Styling | Tailwind CSS | Utility-first, no context switching |
| Storage (leads) | Firebase Firestore | Zero-server, free tier sufficient |
| AI summary | Anthropic API (`claude-sonnet-4-5`) | Assignment requirement; graceful fallback |
| Deploy | Vercel | Git-connected, instant preview URLs |
| Tests | Vitest | Native Vite integration, fast |
| CI | GitHub Actions | Lint + test on every push to `main` |

