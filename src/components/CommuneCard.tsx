import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Commune } from "../types";

const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus };
const activityClasses: Record<Commune["permitActivity"], string> = {
  high: "text-score-excellent bg-score-excellent-bg",
  medium: "text-score-moderate bg-score-moderate-bg",
  low: "text-ink-500 bg-ink-100",
};
const activityLabel: Record<Commune["permitActivity"], string> = {
  high: "élevée",
  medium: "moyenne",
  low: "faible",
};
const trendLabel: Record<Commune["densityTrend"], string> = {
  up: "en hausse",
  down: "en baisse",
  flat: "stable",
};
const regionLabel: Record<Commune["region"], string> = {
  Brussels: "Bruxelles",
  Flanders: "Flandre",
};

export function CommuneCard({
  commune,
  selected,
  onToggle,
  opportunityCount,
}: {
  commune: Commune;
  selected: boolean;
  onToggle: () => void;
  opportunityCount: number;
}) {
  const TrendIcon = trendIcon[commune.densityTrend];
  return (
    <button
      onClick={onToggle}
      className={`group relative flex flex-col rounded-2xl border bg-white p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-panel ${
        selected ? "border-brand-500 ring-2 ring-brand-100" : "border-ink-150"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-ink-900">{commune.name}</h3>
          <p className="text-[11.5px] text-ink-400">{regionLabel[commune.region]}</p>
        </div>
        <div className="text-right">
          <div className="text-[20px] font-semibold tabular text-ink-900">{commune.developmentFriendliness}</div>
          <div className="text-[10.5px] text-ink-400">facilité /10</div>
        </div>
      </div>

      <p className="mt-2.5 text-[12.5px] leading-snug text-ink-500">{commune.blurb}</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-ink-100 pt-3.5">
        <Metric label="Taux d'approbation" value={`${commune.approvalRate}%`} />
        <Metric label="Délai médian" value={`${commune.medianDecisionDays}j`} />
        <Metric label="Dossiers incomplets" value={`${commune.incompleteFileRate}%`} />
        <Metric label="Opportunités" value={`${opportunityCount}`} />
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${activityClasses[commune.permitActivity]}`}>
          activité {activityLabel[commune.permitActivity]}
        </span>
        <span className="flex items-center gap-1 text-[11.5px] font-medium text-ink-500">
          <TrendIcon size={13} />
          densité {trendLabel[commune.densityTrend]}
        </span>
      </div>

      {selected && (
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white shadow-card">
          ✓
        </span>
      )}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[13.5px] font-semibold tabular text-ink-900">{value}</div>
      <div className="text-[10.5px] text-ink-500">{label}</div>
    </div>
  );
}
