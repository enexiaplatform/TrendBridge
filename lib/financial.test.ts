import { describe, expect, it } from "vitest";
import { calculateFinancials } from "./financial";

describe("calculateFinancials", () => {
  it("matches the canonical vacuum-container fixture", () => {
    const result = calculateFinancials({
      sellingPrice: 99_000,
      purchaseCost: 35_000,
      logistics: 12_000,
      fulfillment: 0,
      packaging: 0,
      platformFeeRate: 0.2,
      paymentFeeRate: 0,
      advertising: 10_000,
      returnLossRate: 0,
      otherVariableCosts: 0,
    });
    expect(result.platformFee).toBe(19_800);
    expect(result.contributionProfit).toBe(22_200);
    expect(result.contributionMargin).toBeCloseTo(0.224242, 5);
    expect(result.breakEvenPrice).toBe(71_250);
  });

  it("does not manufacture a break-even price when rates consume all revenue", () => {
    const result = calculateFinancials({
      sellingPrice: 100_000,
      purchaseCost: 10_000,
      logistics: 0,
      fulfillment: 0,
      packaging: 0,
      platformFeeRate: 1,
      paymentFeeRate: 0,
      advertising: 0,
      returnLossRate: 0,
      otherVariableCosts: 0,
    });
    expect(result.breakEvenPrice).toBeNull();
  });
});
