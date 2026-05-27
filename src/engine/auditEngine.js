// src/engine/auditEngine.js
import { TOOLS} from "../data/pricingData";

/**
 * Main audit function.
 * @param {Array} tools - Array of { toolKey, planKey, seats, monthlySpend }
 * @param {Object} context - { teamSize, useCase }
 * @returns {Object} Full audit result
 */
export function runAudit(tools, context) {
  const { teamSize, useCase } = context;
  const results = tools.map((entry) => auditTool(entry, context));

  const totalCurrentSpend = results.reduce((sum, r) => sum + r.currentMonthlySpend, 0);
  const totalSavings = results.reduce((sum, r) => sum + r.monthlySavings, 0);
  const annualSavings = totalSavings * 12;

  return {
    results,
    totalCurrentSpend,
    totalSavings,
    annualSavings,
    savingsTier: getSavingsTier(totalSavings),
    useCase,
    teamSize,
  };
}

function auditTool(entry, context) {
  const { toolKey, planKey, seats, monthlySpend } = entry;
  const { teamSize, useCase } = context;
  const tool = TOOLS[toolKey];

  if (!tool) return unknownToolResult(entry);

  const plan = tool.plans[planKey];
  const recommendations = [];

  // --- Rule 1: Plan-level downgrade ---
  const downgrade = checkDowngrade(tool, planKey, seats);
  if (downgrade) {
    recommendations.push(downgrade);
  }

  // --- Rule 2: Seat over-provisioning ---
  const seatCheck = checkSeatOverprovisioning(tool, planKey, seats, monthlySpend, teamSize);
  if (seatCheck) {
    recommendations.push(seatCheck);
  }

  // --- Rule 3: Alternative tool ---
  const alternative = checkAlternative(toolKey, planKey, seats, monthlySpend);
  if (alternative) {
    recommendations.push(alternative);
  }

  // --- Rule 4: API vs seat plan ---
  const apiCheck = checkApiVsSeat(toolKey, planKey, seats, monthlySpend);
  if (apiCheck) {
    recommendations.push(apiCheck);
  }

  const bestSaving = recommendations.reduce((max, r) => Math.max(max, r.savingsAmount || 0), 0);

  return {
    toolKey,
    toolName: tool.name,
    planKey,
    planName: plan?.name || planKey,
    seats,
    currentMonthlySpend: monthlySpend,
    recommendations,
    monthlySavings: bestSaving,
    status: bestSaving > 0 ? "overspending" : "optimal",
  };
}

// ─── Individual Rules ───────────────────────────────────────────────────────

function checkDowngrade(tool, planKey, seats) {
  // GitHub Copilot: Business at 1-2 users → Individual is sufficient
  if (tool.name === "GitHub Copilot" && planKey === "business" && seats <= 2) {
    const savings = (19 - 10) * seats;
    return {
      type: "downgrade",
      action: "Switch to Individual plan",
      reason: `With only ${seats} seat(s), Business plan ($19/user) gives you admin features you don't need. Individual ($10/user) covers code completions and chat for small teams.`,
      savingsAmount: savings,
      recommendedPlan: "individual",
    };
  }

  // Claude Team at fewer than 3 users — Pro is cheaper
  if (tool.name === "Claude (Anthropic)" && planKey === "team" && seats < 3) {
    const teamCost = 30 * seats;
    const proCost = 20 * seats;
    const savings = teamCost - proCost;
    return {
      type: "downgrade",
      action: "Switch to individual Pro plans",
      reason: `Claude Team is $30/user/month with a 5-seat minimum billing. With ${seats} user(s), individual Pro plans at $20/user save $${savings}/mo with equivalent features for small teams.`,
      savingsAmount: savings,
      recommendedPlan: "pro",
    };
  }

  // ChatGPT Team at 1 user — Plus is enough
  if (tool.name === "ChatGPT (OpenAI)" && planKey === "team" && seats === 1) {
    const savings = 30 - 20;
    return {
      type: "downgrade",
      action: "Switch to ChatGPT Plus",
      reason: "Team plan ($30/user) adds an admin console and workspace features that a solo user doesn't need. Plus ($20) gives identical model access.",
      savingsAmount: savings,
      recommendedPlan: "plus",
    };
  }

  // Cursor Business at 1 user — Pro is identical feature set
  if (tool.name === "Cursor" && planKey === "business" && seats === 1) {
    const savings = (40 - 20) * seats;
    return {
      type: "downgrade",
      action: "Switch to Cursor Pro",
      reason: "Business ($40/user) adds centralized billing and an admin dashboard — features irrelevant for a solo user. Pro ($20) has identical AI model access.",
      savingsAmount: savings,
      recommendedPlan: "pro",
    };
  }

  return null;
}

function checkSeatOverprovisioning(tool, planKey, seats, monthlySpend, teamSize) {
  if (!teamSize || seats <= teamSize) return null;

  const excessSeats = seats - teamSize;
  const plan = tool.plans[planKey];
  if (!plan?.price) return null;

  const savings = excessSeats * plan.price;
  return {
    type: "seats",
    action: `Remove ${excessSeats} unused seat(s)`,
    reason: `You're paying for ${seats} seats but your team has ${teamSize} members. Removing ${excessSeats} unused seat(s) at $${plan.price}/seat saves $${savings}/mo.`,
    savingsAmount: savings,
  };
}

function checkAlternative(toolKey, planKey, seats, monthlySpend, useCase) {
  // Cursor Pro → Windsurf Pro (cheaper for teams focused on cost)
  if (toolKey === "cursor" && planKey === "pro" && seats >= 3) {
    const cursorCost = 20 * seats;
    const windsurfCost = 15 * seats;
    const savings = cursorCost - windsurfCost;
    return {
      type: "alternative",
      action: "Consider Windsurf Pro as an alternative",
      reason: `Windsurf Pro at $15/user/month offers comparable AI-assisted coding for teams. Switching ${seats} seats saves $${savings}/mo. Best fit if your team doesn't rely heavily on Cursor's proprietary Sonnet integration.`,
      savingsAmount: savings,
      alternativeTool: "windsurf",
      alternativePlan: "pro",
    };
  }

  // ChatGPT Plus for pure writing use case → Claude Pro (same price, better writing)
  if (toolKey === "chatgpt" && planKey === "plus" && useCase === "writing") {
    return {
      type: "alternative",
      action: "Consider Claude Pro for writing workflows",
      reason: "Claude Pro ($20/user) is widely preferred for long-form writing, editing, and content generation — same price as ChatGPT Plus but with longer context windows and stronger writing benchmarks.",
      savingsAmount: 0,
      alternativeTool: "claude",
      alternativePlan: "pro",
    };
  }

  // Both Cursor AND GitHub Copilot active — likely redundant
  return null; // Cross-tool check handled at runAudit level (future)
}

function checkApiVsSeat(toolKey, planKey, seats, monthlySpend) {
  // High API-like spend on a seat plan for devs who build products
  if (
    (toolKey === "anthropic_api" || toolKey === "openai_api") &&
    monthlySpend > 200 &&
    seats <= 2
  ) {
    return {
      type: "credits",
      action: "Explore discounted API credits via Credex",
      reason: `At $${monthlySpend}/mo on API usage, you're spending at a rate where discounted credits can generate meaningful savings. Credex sources AI infrastructure credits from companies that overforecast.`,
      savingsAmount: Math.round(monthlySpend * 0.2), // conservative 20% estimate
    };
  }

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSavingsTier(monthlySavings) {
  if (monthlySavings > 500) return "high";    // Surface Credex prominently
  if (monthlySavings > 100) return "medium";
  if (monthlySavings > 0)   return "low";
  return "optimal";                            // Already spending well
}

function unknownToolResult(entry) {
  return {
    toolKey: entry.toolKey,
    toolName: entry.toolKey,
    planKey: entry.planKey,
    seats: entry.seats,
    currentMonthlySpend: entry.monthlySpend,
    recommendations: [],
    monthlySavings: 0,
    status: "unknown",
  };
}