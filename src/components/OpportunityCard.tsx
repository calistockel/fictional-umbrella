import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import type { Opportunity } from "../types";
import { communeById } from "../data/communes";
import { ScoreBadge } from "./ScoreBadge";
import { bandForScore, bandLabel, formatRange } from "../lib/scoring";
import { useSaved } from "../lib/SavedContext";

export function OpportunityCard({ opp, compact = false }: { opp: Opportunity; compact?: boolean }) {
  const commune = communeById(opp.communeId);
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(opp.id);
  const band = bandForScore(opp.score);

  return (
    <Link
      to={`/opportunity/${opp.id}`}
      className="group relative block rounded-2xl border border-ink-150 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-panel"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleSaved(opp.id);
        }}
        aria-label={saved ? "Remove from saved" : "Save opportunity"}
        className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          saved ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-400 hover:text-ink-700"
        }`}
      >
        <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
      </button>

      <div className="flex items-start gap-3">
        <ScoreBadge score={opp.score} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[14.5px] font-semibold text-ink-900">{commune.name}</h3>
            {opp.detectedDaysAgo === 0 && (
              <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                NEW
              </span>
            )}
          </div>
          <p className="truncate text-[12.5px] text-ink-500">{opp.address}</p>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-ink-50 py-1.5">
          <div className="text-[13px] font-semibold tabular text-ink-900">{opp.siteAreaM2.toLocaleString("en-US")} m²</div>
          <div className="text-[10.5px] text-ink-500">Site</div>
        </div>
        <div className="rounded-lg bg-ink-50 py-1.5">
          <div className="text-[13px] font-semibold tabular text-ink-900">{formatRange(opp.units)}</div>
          <div className="text-[10.5px] text-ink-500">Units</div>
        </div>
        <div className="rounded-lg bg-ink-50 py-1.5">
          <div className="text-[13px] font-semibold tabular text-ink-900">{opp.planningConfidencePct}%</div>
          <div className="text-[10.5px] text-ink-500">Confidence</div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 border-t border-ink-100 pt-2.5">
          <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-400">Why it stands out</p>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-600">
            {opp.whyItWorks.slice(0, 2).join(" · ")}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-ink-400">{bandLabel[band]}</span>
        <span className="text-[12.5px] font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
          View opportunity →
        </span>
      </div>
    </Link>
  );
}
