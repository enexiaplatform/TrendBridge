export const markets = {
  US: { name: "United States", currency: "USD", locale: "en-US", channels: ["Amazon", "TikTok Shop", "Own store", "Other"] },
  VN: { name: "Vietnam", currency: "VND", locale: "vi-VN", channels: ["Shopee", "TikTok Shop", "Lazada", "Own store", "Other"] },
  GB: { name: "United Kingdom", currency: "GBP", locale: "en-GB", channels: ["Amazon", "Own store", "Other"] },
  DE: { name: "Germany", currency: "EUR", locale: "de-DE", channels: ["Amazon", "Own store", "Other"] },
  AU: { name: "Australia", currency: "AUD", locale: "en-AU", channels: ["Amazon", "Own store", "Other"] },
} as const;
export const currencies = ["USD", "VND", "GBP", "EUR", "AUD", "CNY"] as const;
export function money(value: number | null, currency: string, locale = "en-US") {
  if (value === null || !Number.isFinite(value)) return "Unknown";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currency === "VND" ? 0 : 2 }).format(value);
}
