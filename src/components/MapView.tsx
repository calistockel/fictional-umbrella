import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { Plus, Minus } from "lucide-react";
import type { Opportunity } from "../types";
import { communes } from "../data/communes";
import { opportunities as allOpportunities } from "../data/opportunities";
import { bandForScore } from "../lib/scoring";
import { boundsFor, project } from "../lib/geo";

const bandColor: Record<string, string> = {
  excellent: "#0a8f5b",
  strong: "#4a3fd6",
  worth_investigating: "#b06a06",
  low: "#93949f",
};

// Fixed bounds from the full dataset so the canvas doesn't jump as filters change.
const WORLD_BOUNDS = boundsFor([...communes, ...allOpportunities]);

export function MapView({
  opportunities,
  activeId,
  onSelect,
}: {
  opportunities: Opportunity[];
  activeId?: string | null;
  onSelect: (id: string) => void;
}) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const projected = useMemo(
    () => opportunities.map((o) => ({ opp: o, ...project(o.lat, o.lng, WORLD_BOUNDS) })),
    [opportunities]
  );
  const communeLabels = useMemo(
    () => communes.map((c) => ({ commune: c, ...project(c.lat, c.lng, WORLD_BOUNDS) })),
    []
  );

  function clampScale(v: number) {
    return Math.min(2.6, Math.max(0.85, v));
  }

  function onWheel(e: ReactWheelEvent) {
    e.preventDefault();
    setScale((s) => clampScale(s - e.deltaY * 0.0015));
  }

  function onPointerDown(e: ReactPointerEvent) {
    dragState.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
  }
  function onPointerUp() {
    dragState.current = null;
    setDragging(false);
  }

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden"
      style={{ background: "linear-gradient(135deg, #eef1ee 0%, #e9ece8 55%, #e7eae5 100%)", touchAction: "none" }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        className={dragging ? "" : "transition-transform duration-200 ease-out"}
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center center",
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        <MapBackdrop />

        {communeLabels.map(({ commune, xPct, yPct }) => (
          <div
            key={commune.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-medium uppercase tracking-wide text-ink-400/70"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            {commune.name}
          </div>
        ))}

        {projected.map(({ opp, xPct, yPct }) => {
          const active = opp.id === activeId;
          const color = bandColor[bandForScore(opp.score)];
          return (
            <button
              key={opp.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opp.id);
              }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-semibold text-white shadow-[0_2px_8px_rgba(11,12,15,0.22)] ring-2 ring-white transition-all hover:scale-110"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                width: active ? 42 : 34,
                height: active ? 42 : 34,
                fontSize: active ? 14 : 12,
                background: color,
                boxShadow: active ? `0 2px 10px rgba(11,12,15,0.28), 0 0 0 4px ${color}2e` : undefined,
                zIndex: active ? 20 : 10,
              }}
            >
              {opp.score}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-lg border border-ink-150 bg-white shadow-card">
        <button
          onClick={() => setScale((s) => clampScale(s + 0.25))}
          className="flex h-8 w-8 items-center justify-center text-ink-600 hover:bg-ink-50"
        >
          <Plus size={14} />
        </button>
        <div className="h-px bg-ink-150" />
        <button
          onClick={() => setScale((s) => clampScale(s - 0.25))}
          className="flex h-8 w-8 items-center justify-center text-ink-600 hover:bg-ink-50"
        >
          <Minus size={14} />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 text-[10.5px] text-ink-400">
        Illustrative map · not to scale
      </div>
    </div>
  );
}

function MapBackdrop() {
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#d7dbd6" strokeWidth="0.08" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#grid)" />
      <path
        d="M 8 78 C 22 70, 30 55, 38 46 C 46 37, 52 30, 58 18 C 62 10, 66 6, 72 2"
        fill="none"
        stroke="#c3cdc3"
        strokeWidth="0.5"
        opacity="0.55"
      />
      <ellipse cx="63" cy="58" rx="14" ry="10" fill="#dde5dc" opacity="0.55" />
      <ellipse cx="30" cy="30" rx="10" ry="7" fill="#dde5dc" opacity="0.4" />
    </svg>
  );
}
