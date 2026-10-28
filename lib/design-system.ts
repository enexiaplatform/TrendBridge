export const trendBridgeTokens = {
  color: {
    brand: { midnight: "#031B42", navy: "#002B67", ocean: "#005BC9", cobalt: "#005BC9", cyan: "#00ADEF", teal: "#00ABAA", cyanBright: "#54DFDE", gradient: "linear-gradient(115deg, #005BC9 0%, #00ADEF 48%, #00C9A7 100%)" },
    neutral: { white: "#FFFFFF", canvas: "#F5F8FB", border: "#DBE4EE", muted: "#61708A", ink: "#0B1830" },
    evidence: { verified: "#0DA77B", estimated: "#CF7A10", risk: "#DD4355", unavailable: "#66768A" },
    chart: ["#05A9C7", "#0DA77B", "#7567E8", "#CF7A10", "#DD4355", "#61708A"],
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 24: 96 },
  radius: { control: 10, panel: 14, feature: 18, pill: 999 },
  shadow: { panel: "0 4px 17px rgba(9, 37, 64, .03)", floating: "0 18px 55px rgba(13, 37, 62, .09)" },
  motion: { fast: 140, standard: 220, deliberate: 360 },
} as const;

export type EvidenceTone = "verified" | "estimated" | "risk" | "unavailable";
export type ButtonTone = "primary" | "accent" | "secondary" | "ghost" | "danger";
