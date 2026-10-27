import { z } from "zod";

export const financialInputSchema = z.object({
  sellingPrice: z.number().nonnegative(),
  purchaseCost: z.number().nonnegative(),
  logistics: z.number().nonnegative().default(0),
  fulfillment: z.number().nonnegative().default(0),
  packaging: z.number().nonnegative().default(0),
  platformFeeRate: z.number().min(0).max(1).default(0),
  paymentFeeRate: z.number().min(0).max(1).default(0),
  advertising: z.number().nonnegative().default(0),
  returnLossRate: z.number().min(0).max(1).default(0),
  otherVariableCosts: z.number().nonnegative().default(0),
});

export type FinancialInput = z.infer<typeof financialInputSchema>;

export type FinancialOutput = {
  revenue: number;
  platformFee: number;
  paymentFee: number;
  returnLoss: number;
  totalVariableCost: number;
  contributionProfit: number;
  contributionMargin: number;
  breakEvenPrice: number | null;
  maxAcquisitionCost: number;
};

export function calculateFinancials(raw: FinancialInput): FinancialOutput {
  const input = financialInputSchema.parse(raw);
  const platformFee = input.sellingPrice * input.platformFeeRate;
  const paymentFee = input.sellingPrice * input.paymentFeeRate;
  const returnLoss = input.sellingPrice * input.returnLossRate;
  const fixedPerUnit = input.purchaseCost + input.logistics + input.fulfillment + input.packaging + input.advertising + input.otherVariableCosts;
  const totalVariableCost = fixedPerUnit + platformFee + paymentFee + returnLoss;
  const contributionProfit = input.sellingPrice - totalVariableCost;
  const variableRate = input.platformFeeRate + input.paymentFeeRate + input.returnLossRate;
  const breakEvenPrice = variableRate >= 1 ? null : fixedPerUnit / (1 - variableRate);
  return {
    revenue: input.sellingPrice,
    platformFee,
    paymentFee,
    returnLoss,
    totalVariableCost,
    contributionProfit,
    contributionMargin: input.sellingPrice === 0 ? 0 : contributionProfit / input.sellingPrice,
    breakEvenPrice,
    maxAcquisitionCost: Math.max(0, input.advertising + contributionProfit),
  };
}

export function formatVnd(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Không xác định";
  return `${Math.round(value).toLocaleString("vi-VN")} ₫`;
}
