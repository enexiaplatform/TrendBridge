import { AlertTriangle, CheckCircle2, CircleHelp, Clock3 } from "lucide-react";
import type { EvidenceTone } from "@/lib/design-system";

const icons = { verified: CheckCircle2, estimated: Clock3, risk: AlertTriangle, unavailable: CircleHelp };

export function EvidenceBadge({ tone, children }: { tone: EvidenceTone; children: React.ReactNode }) {
  const Icon = icons[tone];
  return <span className={`ds-evidence ds-evidence--${tone}`}><Icon size={13} aria-hidden />{children}</span>;
}
