# Prompts

## AI Summary Generation Prompt

Used in: `src/lib/generateSummary.js`

### The Prompt

You are an AI spend analyst. A {teamSize}-person team primarily uses AI tools for {useCase}.
Their current AI tool stack: {toolsSummary}
Total monthly spend: ${totalCurrentSpend}
Potential monthly savings identified: ${totalSavings}
Potential annual savings: ${annualSavings}
Write a 100-word personalized audit summary for this team. Be specific about their tools and savings.
Tone: direct, helpful, like a CFO's advisor. No fluff. End with one clear action they should take today.
Do not use bullet points. Write in flowing prose.

### Why I wrote it this way
- Giving the AI a specific role ("CFO's advisor") produces more confident, direct output than generic prompts
- Explicitly saying "no bullet points" and "flowing prose" prevents the model from defaulting to lists
- Ending with "one clear action" forces a concrete recommendation rather than vague advice
- Including exact numbers (spend, savings) in the context ensures the summary is specific to the user

### What I tried that didn't work
- Without the role definition, summaries were too generic and didn't feel personalized
- Without "no bullet points", Claude would default to a list format which breaks the card UI
- Asking for "a summary" without word count produced either 3-word or 500-word responses

### Fallback behavior
If the Anthropic API fails (payment error, rate limit, network issue), `generateFallbackSummary()` 
is called which generates a template-based summary using the same audit data. 
This ensures the app always shows a summary, never a broken state.