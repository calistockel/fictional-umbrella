import { Link } from "react-router-dom";
import { Bookmark, ArrowRight } from "lucide-react";
import { opportunities } from "../data/opportunities";
import { OpportunityCard } from "../components/OpportunityCard";
import { useSaved } from "../lib/SavedContext";

export function Saved() {
  const { savedIds } = useSaved();
  const saved = opportunities.filter((o) => savedIds.includes(o.id)).sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-8">
      <h1 className="text-[24px] font-semibold tracking-tight text-ink-900">Enregistrés</h1>
      <p className="mt-1 text-[14px] text-ink-500">Votre liste de suivi des opportunités à revisiter.</p>

      {saved.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-400">
            <Bookmark size={18} />
          </div>
          <p className="mt-3 text-[14px] font-medium text-ink-700">Rien d'enregistré pour l'instant</p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-500">
            Enregistrez une opportunité depuis Découvrir ou sa fiche détaillée pour construire votre liste de suivi.
          </p>
          <Link
            to="/"
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
          >
            Aller à Découvrir <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}
    </div>
  );
}
