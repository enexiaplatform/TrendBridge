import { describe, expect, it } from "vitest";
import { emptyIntakeDraft, restoreIntakeDraft } from "./draft";
import { researchInputSchema } from "./contract";

describe("recoverable research intake", () => {
  it("round-trips cross-currency drafts without turning unknowns into zero", () => {
    const draft = { ...emptyIntakeDraft(), name: "Travel mug", costCurrency: "CNY", purchaseCost: "70", fxRate: "0.14", advertising: "0", logistics: "" };
    const restored = restoreIntakeDraft(JSON.stringify(draft));
    expect(restored).toEqual(draft); expect(restored?.logistics).toBe(""); expect(restored?.advertising).toBe("0");
  });
  it("rejects damaged, oversized and unsupported local state", () => {
    for (const raw of [null, "broken", "x".repeat(12001), JSON.stringify({ ...emptyIntakeDraft(), version: 2 }), JSON.stringify({ ...emptyIntakeDraft(), market: "Earth" }), JSON.stringify({ ...emptyIntakeDraft(), entitlement: "paid" })]) expect(restoreIntakeDraft(raw)).toBeNull();
  });
  it("allows a useful scope-only snapshot without financial estimates", () => {
    const draft = emptyIntakeDraft();
    const { version: _, reportLanguage, ...input } = draft;
    const result = researchInputSchema.safeParse({ ...input, name: "Travel mug", language: reportLanguage, sellingPrice: null, purchaseCost: null, logistics: null, advertising: null, platformFeeRate: null, fxRate: null });
    expect(result.success).toBe(true); if (result.success) expect(result.data.purchaseCost).toBeNull();
  });
});
