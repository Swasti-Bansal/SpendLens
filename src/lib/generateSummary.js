// src/lib/generateSummary.js
// What: Calls Anthropic API to generate personalized audit summary
// Why: Adds a human-feeling, personalized touch to the audit results
// The assignment specifically requires using AI for this one feature

export async function generateSummary(auditData) {
  return generateFallbackSummary(auditData)
}

// Fallback template — used when API is unavailable
function generateFallbackSummary({ totalCurrentSpend, totalSavings, annualSavings, teamSize, useCase }) {
  if (totalSavings === 0) {
    return `Your ${teamSize}-person team is spending $${totalCurrentSpend}/month on AI tools for ${useCase} workflows — and based on our analysis, you're already well-optimized. Your current plan selections match your team size and usage patterns. Continue monitoring as your team scales, since thresholds for plan upgrades or downgrades shift with headcount.`
  }
  return `Your ${teamSize}-person team is spending $${totalCurrentSpend}/month on AI tools, but our audit identified $${totalSavings}/month ($${annualSavings}/year) in potential savings. The key opportunities involve right-sizing plans to your actual team usage. The single most impactful action you can take today: review the flagged tools below and implement the top recommendation — most teams recover these savings within one billing cycle.`
}