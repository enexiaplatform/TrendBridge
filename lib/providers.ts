export type ProviderStatus = { id: string; label: string; configured: boolean; reason?: string };

export function providerStatuses(): ProviderStatus[] {
  return [
    { id: "search", label: "Nghiên cứu thị trường", configured: process.env.SEARCH_PROVIDER !== "disabled" && Boolean(process.env.SEARCH_API_KEY), reason: "Chưa cấu hình nhà cung cấp tìm kiếm được cấp phép" },
    { id: "ai", label: "Tổng hợp AI", configured: process.env.AI_PROVIDER !== "disabled" && Boolean(process.env.OPENAI_API_KEY), reason: "Chưa cấu hình nhà cung cấp mô hình" },
    { id: "payment", label: "Thanh toán", configured: process.env.PAYMENT_PROVIDER !== "disabled" && Boolean(process.env.PAYOS_CHECKSUM_KEY), reason: "Chưa hoàn tất cấu hình merchant và webhook" },
  ];
}
