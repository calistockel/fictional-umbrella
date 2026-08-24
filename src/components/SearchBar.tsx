import { useState, useRef, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Chip, Criteria } from "../lib/nlSearch";
import { exampleQueries } from "../lib/nlSearch";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  chips: Chip[];
  onRemoveChip: (key: string) => void;
  criteria: Criteria;
  onCriteriaChange: (c: Criteria) => void;
}

export function SearchBar({ query, onQueryChange, chips, onRemoveChip, criteria, onCriteriaChange }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setFiltersOpen(false);
    }
    if (filtersOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filtersOpen]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3.5 shadow-card transition-shadow focus-within:shadow-panel focus-within:border-ink-300">
        <Search size={18} className="shrink-0 text-ink-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search an area or describe what you're looking for…"
          className="w-full bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        <div className="relative shrink-0" ref={popRef}>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              filtersOpen ? "bg-ink-100 text-ink-900" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
          </button>
          {filtersOpen && (
            <div className="animate-fade-in-up absolute right-0 top-11 z-50 w-72 rounded-xl border border-ink-150 bg-white p-4 shadow-pop">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Advanced filters</p>
              <div className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-ink-700">Units range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={criteria.unitsMin ?? ""}
                      onChange={(e) => onCriteriaChange({ ...criteria, unitsMin: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-400 focus:outline-none"
                    />
                    <span className="text-ink-300">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={criteria.unitsMax ?? ""}
                      onChange={(e) => onCriteriaChange({ ...criteria, unitsMax: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-ink-700">Minimum site area (m²)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={criteria.minSiteArea ?? ""}
                    onChange={(e) => onCriteriaChange({ ...criteria, minSiteArea: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-400 focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-[13px] text-ink-700">
                  <input
                    type="checkbox"
                    checked={!!criteria.excludeHighFloodRisk}
                    onChange={(e) => onCriteriaChange({ ...criteria, excludeHighFloodRisk: e.target.checked })}
                    className="h-3.5 w-3.5 accent-brand-500"
                  />
                  Exclude high flood risk
                </label>
                <label className="flex items-center gap-2 text-[13px] text-ink-700">
                  <input
                    type="checkbox"
                    checked={!!criteria.underusedOnly}
                    onChange={(e) => onCriteriaChange({ ...criteria, underusedOnly: e.target.checked })}
                    className="h-3.5 w-3.5 accent-brand-500"
                  />
                  Underused sites only
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip.key}
            className="flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[12px] font-medium text-white"
          >
            {chip.label}
            <button onClick={() => onRemoveChip(chip.key)} className="text-white/60 hover:text-white">
              <X size={11} />
            </button>
          </span>
        ))}
        {chips.length === 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-400">
            <span>Try:</span>
            {exampleQueries.map((ex) => (
              <button
                key={ex}
                onClick={() => onQueryChange(ex)}
                className="rounded-full border border-ink-150 px-2.5 py-1 text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-800"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
