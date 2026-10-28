export type ProviderStatus = { id: string; label: string; configured: boolean; reason?: string };

export function providerStatuses(): ProviderStatus[] {
  return [
    { id: "search", label: "Nghiên cứu thị trường", configured: process.env.SEARCH_PROVIDER !== "disabled" && Boolean(process.env.SEARCH_API_KEY), reason: "Chưa cấu hình nhà cung cấp tìm kiếm được cấp phép" },
    { id: "manus", label: "Manus research", configured: false, reason: "Live research is awaiting activation; no Manus task is run during this pilot" },
    { id: "payment", label: "Payments", configured: false, reason: "Merchant onboarding and verified global payment fulfillment are not activated" },
  ];
}
