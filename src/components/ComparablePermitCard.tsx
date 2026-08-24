import { CheckCircle2, XCircle, MinusCircle, Clock } from "lucide-react";
import type { ComparablePermit } from "../types";

const statusMeta: Record<ComparablePermit["status"], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Approuvé", className: "text-score-excellent bg-score-excellent-bg", icon: CheckCircle2 },
  refused: { label: "Refusé", className: "text-risk-high bg-red-50", icon: XCircle },
  withdrawn: { label: "Retiré", className: "text-ink-500 bg-ink-100", icon: MinusCircle },
  pending: { label: "En attente", className: "text-score-moderate bg-score-moderate-bg", icon: Clock },
};

export function ComparablePermitCard({ permit }: { permit: ComparablePermit }) {
  const meta = statusMeta[permit.status];
  const Icon = meta.icon;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-150 bg-white px-3.5 py-3">
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium text-ink-900">{permit.label}</p>
        <p className="truncate text-[12px] text-ink-500">{permit.note}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="text-[13px] font-semibold tabular text-ink-900">{permit.distanceM} m</p>
          <p className="text-[11px] text-ink-400">distance</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold tabular text-ink-900">{permit.units}</p>
          <p className="text-[11px] text-ink-400">unités</p>
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-medium ${meta.className}`}>
          <Icon size={12} />
          {meta.label} · {permit.year}
        </span>
      </div>
    </div>
  );
}
