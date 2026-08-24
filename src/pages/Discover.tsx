import { useMemo, useState } from "react";
import { opportunities } from "../data/opportunities";
import { SearchBar } from "../components/SearchBar";
import { MapView } from "../components/MapView";
import { QuickViewPanel } from "../components/QuickViewPanel";
import { OpportunityCard } from "../components/OpportunityCard";
import { parseQuery, type Criteria, type Chip } from "../lib/nlSearch";
import { applyCriteria } from "../lib/filter";

export function Discover() {
  const [query, setQuery] = useState("");
  const [manualCriteria, setManualCriteria] = useState<Criteria>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const { criteria: nlCriteria, chips: nlChips } = useMemo(() => parseQuery(query), [query]);
  const criteria = useMemo(() => ({ ...nlCriteria, ...manualCriteria }), [nlCriteria, manualCriteria]);

  const chips = useMemo<Chip[]>(() => {
    const list = [...nlChips];
    if (manualCriteria.unitsMin != null || manualCriteria.unitsMax != null) {
      list.push({ key: "units", label: `${manualCriteria.unitsMin ?? "0"}–${manualCriteria.unitsMax ?? "∞"} units` });
    }
    if (manualCriteria.minSiteArea != null) {
      list.push({ key: "area", label: `≥ ${manualCriteria.minSiteArea.toLocaleString("en-US")} m²` });
    }
    if (manualCriteria.excludeHighFloodRisk) list.push({ key: "flood", label: "Low flood risk" });
    if (manualCriteria.underusedOnly) list.push({ key: "underused", label: "Underused sites" });
    // de-dupe by key, manual filters win
    const seen = new Set<string>();
    return list.filter((c) => (seen.has(c.key) ? false : (seen.add(c.key), true)));
  }, [nlChips, manualCriteria]);

  const results = useMemo(() => {
    return applyCriteria(opportunities, criteria).sort((a, b) => b.score - a.score);
  }, [criteria]);

  const newToday = opportunities.filter((o) => o.detectedDaysAgo === 0).length;
  const strongMatches = opportunities.filter((o) => o.score >= 70).length;

  const activeOpp = results.find((o) => o.id === activeId) ?? null;

  function removeChip(key: string) {
    if (key === "type") return;
    if (["units", "area", "flood", "underused", "commune"].includes(key)) {
      setManualCriteria((c) => {
        const next = { ...c };
        if (key === "units") {
          delete next.unitsMin;
          delete next.unitsMax;
        }
        if (key === "area") delete next.minSiteArea;
        if (key === "flood") next.excludeHighFloodRisk = false;
        if (key === "underused") next.underusedOnly = false;
        if (key === "commune") delete next.communeId;
        return next;
      });
    }
    setQuery("");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-[32px] font-semibold tracking-tight text-ink-900">
          Find your next development opportunity
        </h1>
        <p className="mt-2 text-[15px] text-ink-500">
          Describe your investment strategy. We scan the territory and rank what's worth your time.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-2xl">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          chips={chips}
          onRemoveChip={removeChip}
          criteria={manualCriteria}
          onCriteriaChange={setManualCriteria}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-ink-500">
        <span className="font-medium tabular text-ink-800">{opportunities.length} sites analysed</span>
        <Dot />
        <span className="font-medium tabular text-ink-800">{strongMatches} strong matches</span>
        <Dot />
        <span className="font-medium tabular text-brand-600">{newToday} new today</span>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="relative h-[640px] overflow-hidden rounded-2xl border border-ink-150 shadow-card">
          <MapView opportunities={results} activeId={activeId} onSelect={setActiveId} />
          {activeOpp && <QuickViewPanel opp={activeOpp} onClose={() => setActiveId(null)} />}
        </div>

        <div className="flex h-[640px] flex-col rounded-2xl border border-ink-150 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <h2 className="text-[13.5px] font-semibold text-ink-900">Shortlist</h2>
            <span className="text-[12px] font-medium text-ink-400 tabular">{results.length} results</span>
          </div>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
            {results.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <p className="text-[13.5px] font-medium text-ink-600">No sites match these criteria</p>
                <p className="mt-1 text-[12.5px] text-ink-400">Try widening your search or removing a filter.</p>
              </div>
            )}
            {results.map((opp) => (
              <div key={opp.id} onMouseEnter={() => setActiveId(opp.id)}>
                <OpportunityCard opp={opp} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-ink-300" />;
}
