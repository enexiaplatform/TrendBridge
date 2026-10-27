export type EvidenceCoverage = "insufficient" | "partial" | "substantial";

export function decideVerdict(margin: number, evidence: EvidenceCoverage, unresolvedCriticalRisk: boolean) {
  if (unresolvedCriticalRisk || margin < 0) return { code: "AVOID" as const, label: "Tránh đầu tư" };
  if (evidence === "insufficient") return { code: "HOLD" as const, label: "Tạm dừng" };
  if (margin >= 0.2 && evidence === "substantial") return { code: "GO" as const, label: "Có thể triển khai" };
  return { code: "TEST" as const, label: "Thử nghiệm có điều kiện" };
}
