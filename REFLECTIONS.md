# REFLECTION.md

## 1. The hardest bug I hit this week, and how I debugged it

The hardest issue I faced was a state + calculation desynchronization bug in the FormPage, where seat count changes and plan selection were not consistently reflected in the monthly spend calculations. This caused incorrect audit inputs being passed into the audit engine, which then produced misleading savings estimates.

My first hypothesis was that the audit engine itself was incorrect, so I started by unit-testing `runAudit()` in isolation using static inputs. The outputs were correct, which eliminated the engine as the source of the bug.

Next, I suspected pricing data mismatches, so I validated `pricingData.js` values against the UI. Again, everything matched.

Finally, I traced the issue to React state batching behavior. Seat updates and plan updates were triggering separate state updates, and the derived “monthly spend” was being calculated from stale state in some render cycles.

To confirm this, I added temporary logging at each state transition and observed inconsistent intermediate values during rapid input changes.

The fix was to derive computed spend using `useMemo` instead of storing it in state. This ensured the value always reflected the latest plan, seats, and usage type, removing the race condition entirely.

What I learned is that most “logic bugs” in React apps are actually state modeling problems, not algorithm issues.

---

## 2. A decision you reversed mid-week, and what made you reverse it

Initially, I planned to integrate the Anthropic API directly into the audit engine to generate recommendations dynamically.

Mid-week, I reversed this decision after re-reading the assignment constraints and realizing that the evaluation explicitly prefers deterministic, auditable logic over AI-driven financial reasoning.

The key insight was that audit outputs must be explainable and reproducible. If recommendations vary based on an LLM response, the system becomes non-deterministic and harder to validate.

So I refactored the architecture:

- Audit engine → fully rule-based and deterministic  
- AI usage → limited strictly to post-audit summary generation  

This separation improved testability, clarity, and alignment with evaluation criteria. It also reinforced an important engineering principle: knowing when NOT to use AI is part of good system design.

---

## 3. What you would build in week 2 if you had it

If I had another week, I would evolve SpendLens from a one-time audit tool into a continuous AI spend monitoring system.

Key improvements:

- Add historical audit tracking to show spend changes over time  
- Introduce benchmarking against similar startup teams  
- Replace localStorage with a real backend (Supabase/Postgres)  
- Add Slack/email alerts for recurring spend optimization  
- Improve conversion flow for high-savings users into Credex consultations  
- Implement proper SEO and Open Graph dynamic previews per audit  

The biggest limitation right now is that SpendLens is a single-use snapshot tool. In reality, AI spend optimization is ongoing and should be monitored continuously.

---

## 4. How you used AI tools (and where they failed)

I used AI tools (ChatGPT and coding assistants) primarily for:

- Debugging React state issues  
- Generating UI scaffolding components  
- Improving clarity of recommendation text  

However, I avoided using AI for:

- Audit logic and pricing calculations  
- Core financial decision rules  
- Architecture design decisions involving data flow  

One notable failure I caught was an AI suggestion to move audit reasoning into an LLM. This would have made outputs non-deterministic and untestable, so I rejected it.

Another issue was AI-generated UI code introducing unnecessary state duplication, which I later refactored into derived values.

Overall, AI improved speed but was not trusted for correctness-critical logic.

---

## 5. Self-rating (1–10 scale)

**Discipline — 8/10**  
Worked consistently across 6 days with progressive improvements and shipped a complete end-to-end product. Earlier planning could have been tighter.

**Code quality — 8/10**  
Clear separation between audit engine and UI, strong use of pure functions and testability, but some React state complexity remains.

**Design sense — 7.5/10**  
UI polish improved significantly in later stages (animations, spacing, glass effects), though early iterations were inconsistent.

**Problem-solving — 8.5/10**  
Strong debugging process using hypothesis elimination across engine, data, and UI layers.

**Entrepreneurial thinking — 8/10**  
Clear GTM strategy and user targeting (engineering managers at early-stage startups), but real-world validation is still early.