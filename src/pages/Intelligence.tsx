import { useState } from "react";
import { communes } from "../data/communes";
import { opportunities } from "../data/opportunities";
import { CommuneCard } from "../components/CommuneCard";
import { X } from "lucide-react";

const activityLabel = { high: "Élevée", medium: "Moyenne", low: "Faible" } as const;

export function Intelligence() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  const selectedCommunes = communes.filter((c) => selected.includes(c.id));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink-900">Intelligence urbanistique</h1>
          <p className="mt-1 text-[14px] text-ink-500">
            Indicateurs dérivés des décisions urbanistiques historiques, non publiés dans un jeu de données public.
          </p>
        </div>
        {selectedCommunes.length > 0 && (
          <p className="text-[12.5px] text-ink-400">Sélectionnez jusqu'à 3 communes à comparer</p>
        )}
      </div>

      {selectedCommunes.length >= 2 && (
        <div className="animate-fade-in-up mt-5 overflow-x-auto rounded-2xl border border-ink-150 bg-white shadow-card">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="px-5 py-3 text-[11.5px] font-medium uppercase tracking-wide text-ink-400">Indicateur</th>
                {selectedCommunes.map((c) => (
                  <th key={c.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-ink-900">{c.name}</span>
                      <button onClick={() => toggle(c.id)} className="text-ink-300 hover:text-ink-600">
                        <X size={13} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[13px]">
              <CompareRow label="Taux d'approbation" values={selectedCommunes.map((c) => `${c.approvalRate}%`)} />
              <CompareRow label="Délai médian de décision" values={selectedCommunes.map((c) => `${c.medianDecisionDays} jours`)} />
              <CompareRow label="Taux de dossiers incomplets" values={selectedCommunes.map((c) => `${c.incompleteFileRate}%`)} />
              <CompareRow
                label="Tendance d'approbation (24 mois)"
                values={selectedCommunes.map((c) => `${c.approvalRateTrendPts > 0 ? "+" : ""}${c.approvalRateTrendPts} pts`)}
              />
              <CompareRow label="Activité des permis" values={selectedCommunes.map((c) => activityLabel[c.permitActivity])} />
              <CompareRow label="Facilité de développement" values={selectedCommunes.map((c) => `${c.developmentFriendliness} / 10`)} last />
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {communes.map((c) => (
          <CommuneCard
            key={c.id}
            commune={c}
            selected={selected.includes(c.id)}
            onToggle={() => toggle(c.id)}
            opportunityCount={opportunities.filter((o) => o.communeId === c.id).length}
          />
        ))}
      </div>
    </div>
  );
}

function CompareRow({ label, values, last }: { label: string; values: string[]; last?: boolean }) {
  return (
    <tr className={last ? "" : "border-b border-ink-50"}>
      <td className="px-5 py-2.5 text-ink-500">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-5 py-2.5 font-medium capitalize tabular text-ink-900">
          {v}
        </td>
      ))}
    </tr>
  );
}
