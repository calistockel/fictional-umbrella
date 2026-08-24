import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Bookmark, CheckCircle2, AlertTriangle, ChevronDown, MapPin } from "lucide-react";
import { opportunityById } from "../data/opportunities";
import { communeById } from "../data/communes";
import { permitById } from "../data/permits";
import { ScoreBadge } from "../components/ScoreBadge";
import { ComparablePermitCard } from "../components/ComparablePermitCard";
import { Modal } from "../components/Modal";
import { bandForScore, bandLabel, riskLabel, riskClasses, formatRange } from "../lib/scoring";
import { useSaved } from "../lib/SavedContext";

export function OpportunityDetail() {
  const { id } = useParams();
  const opp = id ? opportunityById(id) : undefined;
  const [showAllComparables, setShowAllComparables] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const { isSaved, toggleSaved } = useSaved();

  if (!opp) return <Navigate to="/" replace />;

  const commune = communeById(opp.communeId);
  const band = bandForScore(opp.score);
  const permits = opp.comparablePermitIds.map((pid) => permitById(pid)!).filter(Boolean);
  const approved = permits.filter((p) => p.status === "approved").length;
  const refused = permits.filter((p) => p.status === "refused").length;
  const withdrawn = permits.filter((p) => p.status === "withdrawn").length;
  const pending = permits.filter((p) => p.status === "pending").length;
  const saved = isSaved(opp.id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Back to Discover
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-ink-150 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ScoreBadge score={opp.score} size="xl" />
          <div>
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-ink-400">
              <MapPin size={12} /> {commune.name}, {commune.region}
            </div>
            <h1 className="mt-0.5 text-[22px] font-semibold tracking-tight text-ink-900">{opp.address}</h1>
            <p className="mt-0.5 text-[13.5px] font-medium text-score-strong">{bandLabel[band]} opportunity</p>
          </div>
        </div>
        <button
          onClick={() => toggleSaved(opp.id)}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
            saved ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-700 hover:border-ink-300"
          }`}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save opportunity"}
        </button>
      </div>

      {/* Key numbers */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <KeyStat value={formatRange(opp.units)} label="Estimated units" />
        <KeyStat value={`${formatRange(opp.buildableM2)} m²`} label="Potential development" />
        <KeyStat value={`${opp.planningConfidencePct}%`} label="Planning confidence" />
      </div>

      {/* Sub-scores */}
      <div className="mt-4 flex items-center gap-6 rounded-2xl border border-ink-150 bg-white px-6 py-4 shadow-card">
        <SubScore label="Development" value={opp.subScores.development} />
        <SubScore label="Planning" value={opp.subScores.planning} />
        <SubScore label="Constraints" value={opp.subScores.constraints} />
      </div>

      {/* Why this works / Watch-outs */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Panel title="Why this works" tone="positive">
          {opp.whyItWorks.map((w) => (
            <li key={w} className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-700">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-score-excellent" />
              {w}
            </li>
          ))}
        </Panel>
        <Panel title="Watch-outs" tone="caution">
          {opp.watchOuts.map((w) => (
            <li key={w} className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-score-moderate" />
              {w}
            </li>
          ))}
        </Panel>
      </div>

      {/* Planning intelligence */}
      <section className="mt-4 rounded-2xl border border-ink-150 bg-white p-6 shadow-card">
        <h2 className="text-[15px] font-semibold text-ink-900">Planning intelligence</h2>
        <p className="mt-1 text-[13px] text-ink-500">
          Probability of favourable outcome:{" "}
          <span className="font-semibold text-ink-900">{opp.planningConfidencePct}%</span>, based on {permits.length}{" "}
          comparable permits analysed.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat value={approved} label="Approved" tone="excellent" />
          <MiniStat value={refused} label="Refused" tone="high" />
          <MiniStat value={withdrawn} label="Withdrawn" tone="low" />
          <MiniStat value={pending} label="Pending" tone="moderate" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4 sm:grid-cols-4">
          <FactRow label="Local approval rate" value={`${commune.approvalRate}%`} />
          <FactRow label="Median decision time" value={`${commune.medianDecisionDays} days`} />
          <FactRow
            label="Approval rate trend (24mo)"
            value={`${commune.approvalRateTrendPts > 0 ? "+" : ""}${commune.approvalRateTrendPts} pts`}
          />
          <FactRow label="Density trend" value={commune.densityTrend === "up" ? "Increasing" : commune.densityTrend === "down" ? "Decreasing" : "Stable"} />
        </div>
      </section>

      {/* Comparable permits */}
      <section className="mt-4 rounded-2xl border border-ink-150 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink-900">Comparable projects</h2>
          <span className="text-[12.5px] text-ink-400 tabular">{permits.length} nearby</span>
        </div>
        <div className="mt-3 space-y-2">
          {permits.slice(0, 3).map((p) => (
            <ComparablePermitCard key={p.id} permit={p} />
          ))}
        </div>
        {permits.length > 3 && (
          <button
            onClick={() => setShowAllComparables(true)}
            className="mt-3 text-[13px] font-medium text-brand-600 hover:text-brand-700"
          >
            View all {permits.length} comparables →
          </button>
        )}
      </section>

      {/* Full analysis disclosure */}
      <section className="mt-4 rounded-2xl border border-ink-150 bg-white shadow-card">
        <button
          onClick={() => setShowFullAnalysis((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <span className="text-[13.5px] font-medium text-ink-800">View full analysis</span>
          <ChevronDown size={16} className={`text-ink-400 transition-transform ${showFullAnalysis ? "rotate-180" : ""}`} />
        </button>
        {showFullAnalysis && (
          <div className="animate-fade-in-up border-t border-ink-100 px-6 py-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <FactRow label="Site area" value={`${opp.siteAreaM2.toLocaleString("en-US")} m²`} />
              <FactRow label="Built area (current)" value={`${opp.builtAreaM2.toLocaleString("en-US")} m²`} />
              <FactRow label="Current use ratio" value={`${opp.currentUseRatioPct}%`} />
              <FactRow label="Current building" value={opp.currentBuilding} />
              <FactRow label="Zoning" value={opp.zoning} />
              <FactRow label="Immediate context" value={opp.context} />
              <FactRow label="Flood risk" value={riskLabel(opp.floodRisk)} className={riskClasses(opp.floodRisk)} />
              <FactRow label="Heritage constraint" value={opp.heritageConstraint ? "Yes — validation required" : "None identified"} />
              <FactRow label="Transit access" value={`${opp.transitWalkMin} min walk`} />
              <FactRow label="Estimated timeline" value={`${opp.timelineMonths[0]}–${opp.timelineMonths[1]} months`} />
              <FactRow label="Incomplete file rate (commune)" value={`${commune.incompleteFileRate}%`} />
              <FactRow label="Permit activity (commune)" value={commune.permitActivity} />
            </div>
            <p className="mt-4 text-[11.5px] text-ink-400">
              All development-potential and planning figures are indicative screening estimates derived from public
              zoning data and historical decisions — not a feasibility guarantee or legal determination.
            </p>
          </div>
        )}
      </section>

      {showAllComparables && (
        <Modal title={`${permits.length} comparable permits near ${commune.name}`} onClose={() => setShowAllComparables(false)} wide>
          <div className="space-y-2">
            {permits.map((p) => (
              <ComparablePermitCard key={p.id} permit={p} />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function KeyStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-ink-150 bg-white px-4 py-4 text-center shadow-card">
      <div className="text-[19px] font-semibold tabular text-ink-900">{value}</div>
      <div className="mt-0.5 text-[12px] text-ink-500">{label}</div>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ebebef" strokeWidth="3.5" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="#4a3fd6"
            strokeWidth="3.5"
            strokeDasharray={`${(value / 100) * 97.4} 97.4`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[11px] font-semibold tabular text-ink-900">{value}</span>
      </div>
      <span className="text-[12.5px] font-medium text-ink-600">{label}</span>
    </div>
  );
}

function Panel({ title, tone, children }: { title: string; tone: "positive" | "caution"; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-150 bg-white p-5 shadow-card">
      <h2 className={`text-[13.5px] font-semibold ${tone === "positive" ? "text-score-excellent" : "text-score-moderate"}`}>
        {title}
      </h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function MiniStat({ value, label, tone }: { value: number; label: string; tone: "excellent" | "high" | "low" | "moderate" }) {
  const toneClasses = {
    excellent: "text-score-excellent bg-score-excellent-bg",
    high: "text-risk-high bg-red-50",
    low: "text-ink-500 bg-ink-100",
    moderate: "text-score-moderate bg-score-moderate-bg",
  }[tone];
  return (
    <div className={`rounded-xl px-3 py-2.5 text-center ${toneClasses}`}>
      <div className="text-[18px] font-semibold tabular">{value}</div>
      <div className="text-[11px] font-medium opacity-80">{label}</div>
    </div>
  );
}

function FactRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-[11.5px] text-ink-400">{label}</p>
      <p className={`text-[13px] font-medium text-ink-800 ${className ?? ""}`}>{value}</p>
    </div>
  );
}
