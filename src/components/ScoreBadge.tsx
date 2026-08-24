import { bandForScore, bandClasses } from "../lib/scoring";

const sizeClasses = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-20 w-20 text-2xl",
};

export function ScoreBadge({ score, size = "md" }: { score: number; size?: keyof typeof sizeClasses }) {
  const band = bandForScore(score);
  const classes = bandClasses[band];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold tabular ${classes.bg} ${classes.text} ${sizeClasses[size]}`}
    >
      {score}
    </div>
  );
}

export function ScoreDot({ score }: { score: number }) {
  const band = bandForScore(score);
  const dotColor = {
    excellent: "bg-score-excellent",
    strong: "bg-score-strong",
    worth_investigating: "bg-score-moderate",
    low: "bg-score-low",
  }[band];
  return <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />;
}
