import { describe, it, expect } from "vitest";
import { runAudit } from "./auditEngine";

describe("Audit Engine", () => {
  it("flags GitHub Copilot Business for a 2-person team as overpriced", () => {
    const result = runAudit(
      [{ toolKey: "github_copilot", planKey: "business", seats: 2, monthlySpend: 38 }],
      { teamSize: 2, useCase: "coding" }
    );
    expect(result.results[0].status).toBe("overspending");
    expect(result.totalSavings).toBeGreaterThan(0);
  });

  it("marks optimal spend correctly when plan fits usage", () => {
    const result = runAudit(
      [{ toolKey: "github_copilot", planKey: "individual", seats: 1, monthlySpend: 10 }],
      { teamSize: 1, useCase: "coding" }
    );
    expect(result.results[0].status).toBe("optimal");
    expect(result.totalSavings).toBe(0);
  });

  it("flags seat overprovisioning when seats exceed team size", () => {
    const result = runAudit(
      [{ toolKey: "cursor", planKey: "pro", seats: 5, monthlySpend: 100 }],
      { teamSize: 3, useCase: "coding" }
    );
    const rec = result.results[0].recommendations.find(r => r.type === "seats");
    expect(rec).toBeTruthy();
    expect(rec.savingsAmount).toBe(40); // 2 excess seats × $20
  });

  it("flags Claude Team for a solo user", () => {
    const result = runAudit(
      [{ toolKey: "claude", planKey: "team", seats: 1, monthlySpend: 30 }],
      { teamSize: 1, useCase: "writing" }
    );
    expect(result.results[0].status).toBe("overspending");
    expect(result.totalSavings).toBe(10); // Team $30 → Pro $20
  });

  it("calculates annual savings correctly", () => {
    const result = runAudit(
      [{ toolKey: "cursor", planKey: "business", seats: 1, monthlySpend: 40 }],
      { teamSize: 1, useCase: "coding" }
    );
    expect(result.annualSavings).toBe(result.totalSavings * 12);
  });
});