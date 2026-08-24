import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, TrendingDown, FileClock, Scale, MapPin } from "lucide-react";
import { feedEvents } from "../data/feed";
import { opportunityById } from "../data/opportunities";
import { communeById } from "../data/communes";
import { ScoreDot } from "../components/ScoreBadge";
import type { FeedEvent } from "../types";

const bucketLabel: Record<FeedEvent["bucket"], string> = {
  today: "Today",
  this_week: "This week",
  earlier: "Earlier",
};

const typeIcon: Record<FeedEvent["type"], typeof Sparkles> = {
  new_opportunity: Sparkles,
  comparable_approved: FileClock,
  score_change: TrendingUp,
  regulation_change: Scale,
  resubmission: FileClock,
  parcel_detected: MapPin,
};

export function Alerts() {
  const buckets: FeedEvent["bucket"][] = ["today", "this_week", "earlier"];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-[24px] font-semibold tracking-tight text-ink-900">Opportunity feed</h1>
      <p className="mt-1 text-[14px] text-ink-500">What changed on the territory since your last visit.</p>

      <div className="mt-7 space-y-8">
        {buckets.map((bucket) => {
          const events = feedEvents.filter((e) => e.bucket === bucket);
          if (events.length === 0) return null;
          return (
            <div key={bucket}>
              <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-400">{bucketLabel[bucket]}</h2>
              <div className="space-y-2.5">
                {events.map((event) => (
                  <FeedItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeedItem({ event }: { event: FeedEvent }) {
  const opp = opportunityById(event.opportunityId);
  const commune = opp ? communeById(opp.communeId) : null;
  const Icon = typeIcon[event.type];
  const isScoreDrop = event.type === "score_change" && (event.scoreTo ?? 0) < (event.scoreFrom ?? 0);
  const TrendIconForScore = isScoreDrop ? TrendingDown : TrendingUp;

  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-ink-150 bg-white p-4 shadow-card">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        {event.type === "score_change" ? <TrendIconForScore size={15} /> : <Icon size={15} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {opp && <ScoreDot score={opp.score} />}
          <p className="text-[13.5px] font-semibold text-ink-900">{event.title}</p>
        </div>
        {commune && <p className="mt-0.5 text-[12px] font-medium text-ink-500">{commune.name}</p>}
        <p className="mt-1 text-[13px] leading-snug text-ink-600">{event.description}</p>
        {opp && (
          <Link
            to={`/opportunity/${opp.id}`}
            className="mt-2 inline-block text-[12.5px] font-medium text-brand-600 hover:text-brand-700"
          >
            View →
          </Link>
        )}
      </div>
    </div>
  );
}
