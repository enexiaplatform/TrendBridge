import { z } from "zod";
import { currencies } from "@/lib/global";

const numericText = z.string().max(40);
export const intakeDraftSchema = z.object({
  version: z.literal(1), name: z.string().max(160), description: z.string().max(3000),
  reference: z.string().max(2000), configuration: z.string().max(500),
  market: z.enum(["US", "VN", "GB", "DE", "AU"]), channel: z.string().max(80),
  reportLanguage: z.enum(["en", "vi"]), currency: z.enum(currencies), costCurrency: z.enum(currencies),
  fxRate: numericText, sellingPrice: numericText, purchaseCost: numericText,
  logistics: numericText, advertising: numericText, platformFeeRate: numericText,
}).strict();
export type IntakeDraft = z.infer<typeof intakeDraftSchema>;
export const intakeDraftKey = "trendbridge.intake/v1";
export function emptyIntakeDraft(): IntakeDraft {
  return { version: 1, name: "", description: "", reference: "", configuration: "", market: "US", channel: "Amazon", reportLanguage: "en", currency: "USD", costCurrency: "USD", fxRate: "", sellingPrice: "", purchaseCost: "", logistics: "", advertising: "", platformFeeRate: "" };
}
export function restoreIntakeDraft(raw: string | null): IntakeDraft | null {
  if (!raw || raw.length > 12000) return null;
  try { const parsed = intakeDraftSchema.safeParse(JSON.parse(raw)); return parsed.success ? parsed.data : null; } catch { return null; }
}
