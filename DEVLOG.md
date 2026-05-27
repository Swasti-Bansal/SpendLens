# DEVLOG.md

# Devlog

## Day 1 — 2026-05-22
**Hours worked:** 3

### What I did
Planned the overall project structure and finalized the idea for the AI spend audit tool. Set up the project using React, Vite, TailwindCSS, and Firebase. Created the folder structure and initialized the GitHub repository.

### What I learned
TailwindCSS v4 setup differs from earlier versions, so I had to explicitly configure Tailwind v3 for compatibility.

### Blockers / what I'm stuck on
Firebase configuration and environment setup took longer than expected.

### Plan for tomorrow
Build the pricing data file and audit engine.

---

## Day 2 — 2026-05-23
**Hours worked:** 5

### What I did
Built the `pricingData.js` file containing AI tool pricing plans and created the `auditEngine.js` file with audit rules and recommendation logic. Added unit tests using Vitest and verified the calculations.

### What I learned
Pure function design makes testing much easier and avoids unnecessary complexity.

### Blockers / what I'm stuck on
Finding the right balance between simple audit rules and useful recommendations.

### Plan for tomorrow
Build the FormPage UI and connect it with the audit engine.

---

## Day 3 — 2026-05-24
**Hours worked:** 5

### What I did
Built the FormPage including tool selection, plan selection, seat count, monthly spend input, and localStorage persistence. Connected the form submission flow with the audit engine and added dynamic pricing updates.

### What I learned
React state updates are asynchronous, so dependent calculations need careful handling to avoid stale values.

### Blockers / what I'm stuck on
Managing autofill behavior and keeping spend calculations synchronized with seat updates.

### Plan for tomorrow
Build the ResultsPage and improve audit result presentation.

---

## Day 4 — 2026-05-25
**Hours worked:** 6

### What I did
Built the ResultsPage with savings summaries, AI recommendations, and tool-by-tool breakdowns. Added loading animations, transitions, and improved the report layout. Fixed JSX parsing issues and deployed the project to Vercel for testing.

### What I learned
Special characters like `>` can break JSX parsing and should be replaced with proper HTML entities when necessary.

### Blockers / what I'm stuck on
Anthropic API integration required payment access, so fallback summaries were temporarily used.

### Plan for tomorrow
Conduct user interviews and start writing project documentation.

---

## Day 5 — 2026-05-26
**Hours worked:** 4

### What I did
Reached out to users for interviews and collected feedback about AI spending habits, subscription management, and dashboard preferences. Started writing documentation files including interview notes and setup documentation. Added GitHub Actions CI workflow configuration.

### What I learned
Most users are aware they may be overspending on AI tools but do not actively track their exact monthly costs.

### Blockers / what I'm stuck on
Designing a UI that remains visually appealing while still feeling simple and easy to use.

### Plan for tomorrow
Complete documentation and improve the overall UI design and polish.

---

## Day 6 — 2026-05-27
**Hours worked:** 6

### What I did
Completed all remaining project documentation including the devlog and user interview files. Improved the UI with gradients, animated scan lines, glassmorphism cards, hover effects, loading overlays, and overall visual polish inspired by modern AI product interfaces. Refined spacing, contrast, borders, and responsiveness across the application. Performed final testing and prepared the project for submission.

### What I learned
Small UI details like animation timing, border contrast, shadows, and spacing significantly improve the overall product experience and perceived quality.

### Blockers / what I'm stuck on
Minor responsiveness and UI polish adjustments during final testing.

### Plan for tomorrow
Project submission completed.