// src/lib/generateSummary.js
export async function generateSummary(auditData) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return generateFallbackSummary(auditData)

  try {
    const toolList = auditData.results
      .map(r => `${r.toolName} (${r.planName}, ${r.seats} seat(s), $${r.currentMonthlySpend}/mo)`)
      .join('; ')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 180,
        messages: [{
          role: 'user',
          content: `You are a no-nonsense AI spend analyst. Write an 80-100 word audit summary. Be specific and actionable. No filler words like "overall" or "in conclusion".

Tools audited: ${toolList}
Monthly spend: $${auditData.totalCurrentSpend}
Potential savings: $${auditData.totalSavings}/mo ($${auditData.annualSavings}/yr)
Team size: ${auditData.teamSize}
Use case: ${auditData.useCase}

Write one tight paragraph now:`
        }]
      })
    })

    if (!response.ok) throw new Error(`API ${response.status}`)
    const data = await response.json()
    const text = data.content?.[0]?.text
    if (!text) throw new Error('Empty response')
    return text
  } catch (err) {
    console.warn('Anthropic API unavailable, using fallback:', err.message)
    return generateFallbackSummary(auditData)
  }
}

function generateFallbackSummary({ totalCurrentSpend, totalSavings, annualSavings, teamSize, useCase, results }) {
  if (totalSavings === 0) {
    return `Your ${teamSize}-person team is spending $${totalCurrentSpend}/month on AI tools for ${useCase} workflows — and you're already well-optimized. Your plan selections match your team size and usage patterns. Keep monitoring as your team scales, since upgrade thresholds shift with headcount.`
  }
  const topTool = results?.find(r => r.monthlySavings > 0)
  const pct = Math.round((totalSavings / totalCurrentSpend) * 100)
  return `Your ${teamSize}-person team is spending $${totalCurrentSpend}/month on AI tools with ${pct}% in identified savings. ${topTool ? `The biggest opportunity is ${topTool.toolName} — ${topTool.recommendations?.[0]?.reason?.split('.')[0]}.` : ''} Acting on all recommendations could recover $${annualSavings.toLocaleString()} annually.`
}