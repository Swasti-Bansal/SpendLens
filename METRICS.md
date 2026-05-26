# Metrics

## North Star Metric

**Qualified leads captured per week**

Why: SpendLens is a lead generation tool for Credex. The only metric that matters at this stage is how many people with real AI spend submit their email — specifically those showing savings above $100/mo who are candidates for Credex credits.

DAU would be wrong here — this is a tool people use once, not daily. Sessions are also misleading since a bounce that still completes an audit is valuable.

## Input Metrics

1. **Audit completion rate** — percentage of users who start the form and reach the results page. Target: above 70%. If this drops, the form has friction.

2. **Email capture rate** — percentage of users who complete an audit and submit their email. Target: above 25%. If this drops, the results page isn't delivering enough value or trust.

3. **High-savings audit rate** — percentage of audits showing above $500/mo in savings. These are Credex's best leads. Target: above 15% of all audits.

## What to Instrument First

- Form start event (user adds first tool)
- Audit completed event (results page loads)
- Email submitted event
- Savings tier distribution (optimal / low / medium / high)
- Share button clicks

## Pivot Trigger

If email capture rate drops below 10% after 500 audits — the value shown on the results page is not compelling enough. At that point: test showing savings before asking for email, add social proof to the results page, or simplify the form to reduce drop-off.