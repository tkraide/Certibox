import { AlertTriangle, Info, PartyPopper } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Insight, InsightTone } from "@/lib/hours/insights";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<InsightTone, { icon: LucideIcon; wrap: string; iconColor: string }> = {
  info: {
    icon: Info,
    wrap: "border-primary-100 bg-primary-50 text-primary-900 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-200",
    iconColor: "text-primary-600 dark:text-primary-400",
  },
  warning: {
    icon: AlertTriangle,
    wrap: "border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
    iconColor: "text-neutral-700 dark:text-neutral-300",
  },
  success: {
    icon: PartyPopper,
    wrap: "border-primary-200 bg-primary-50 text-primary-900 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200",
    iconColor: "text-primary-600 dark:text-primary-400",
  },
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <section aria-labelledby="insights-titulo" className="card">
      <h2 id="insights-titulo" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Insights
      </h2>
      <ul className="mt-3 space-y-2">
        {insights.map((insight) => {
          const style = TONE_STYLES[insight.tone];
          const Icon = style.icon;
          return (
            <li
              key={insight.id}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
                style.wrap,
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconColor)} aria-hidden="true" />
              <span>{insight.message}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
