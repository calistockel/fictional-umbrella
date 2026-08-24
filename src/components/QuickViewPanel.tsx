import { Link } from "react-router-dom";
import { X, Bookmark, ArrowRight } from "lucide-react";
import type { Opportunity } from "../types";
import { communeById } from "../data/communes";
import { ScoreBadge } from "./ScoreBadge";
import { formatRange } from "../lib/scoring";
import { useSaved } from "../lib/SavedContext";

export function QuickViewPanel({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const commune = communeById(opp.communeId);
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(opp.id);

  return (
    <div className="animate-slide-in absolute right-4 top-4 z-[500] w-[320px] rounded-2xl border border-ink-150 bg-white p-4 shadow-pop">
      <button onClick={onClose} className="absolute right-3 top-3 text-ink-400 hover:text-ink-800">
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 pr-5">
        <ScoreBadge score={opp.score} size="lg" />
        <div>
          <h3 className="text-[15px] font-semibold text-ink-900">{commune.name}</h3>
          <p className="text-[12.5px] text-ink-500">{opp.address}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="Surface du terrain" value={`${opp.siteAreaM2.toLocaleString("fr-BE")} m²`} />
        <Stat label="Unités potentielles" value={formatRange(opp.units)} />
        <Stat label="Confiance urbanistique" value={`${opp.planningConfidencePct}%`} />
        <Stat label="Délai" value={`${opp.timelineMonths[0]}–${opp.timelineMonths[1]} mois`} />
      </div>

      <div className="mt-4 border-t border-ink-100 pt-3">
        <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-400">Pourquoi elle se démarque</p>
        <ul className="mt-1.5 space-y-1">
          {opp.whyItWorks.slice(0, 2).map((w) => (
            <li key={w} className="text-[12.5px] leading-snug text-ink-600">
              · {w}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          to={`/opportunity/${opp.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink-900 py-2 text-[13px] font-medium text-white transition-colors hover:bg-ink-800"
        >
          Voir l'opportunité <ArrowRight size={13} />
        </Link>
        <button
          onClick={() => toggleSaved(opp.id)}
          className={`flex h-[34px] w-[34px] items-center justify-center rounded-lg border transition-colors ${
            saved ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-500 hover:border-ink-300"
          }`}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 px-2.5 py-2">
      <div className="text-[13px] font-semibold tabular text-ink-900">{value}</div>
      <div className="text-[10.5px] text-ink-500">{label}</div>
    </div>
  );
}
