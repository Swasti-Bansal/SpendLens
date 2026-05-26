# Tests

All tests cover the audit engine — the core business logic of SpendLens.

## Running Tests

```bash
npm test
```

## Test File

`src/engine/auditEngine.test.js`

## Test Coverage

| Test | File | What it covers |
|------|------|----------------|
| GitHub Copilot Business flagged for 2-person team | auditEngine.test.js | Plan downgrade rule — Business unnecessary for small teams |
| Optimal spend marked correctly | auditEngine.test.js | No false positives when plan fits usage |
| Seat overprovisioning detected | auditEngine.test.js | Flags when seats exceed team size |
| Claude Team flagged for solo user | auditEngine.test.js | Downgrade to Pro saves $10/mo |
| Annual savings calculation | auditEngine.test.js | annualSavings = totalSavings × 12 |

## How to Run

```bash
npm test
```

All 5 tests should pass and show green. The CI workflow also runs these on every push to main.