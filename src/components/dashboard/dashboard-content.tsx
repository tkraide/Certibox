"use client";

import { Loader2 } from "lucide-react";

import { useCertificates } from "@/hooks/use-certificates";
import { getCategoryProgress, getTotals } from "@/lib/hours/aggregate";
import { getInsights } from "@/lib/hours/insights";

import { CategoryMeter } from "./category-meter";
import { InsightsPanel } from "./insights-panel";
import { SummaryCards } from "./summary-cards";

export function DashboardContent() {
  const { certificates, loaded } = useCertificates();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500 dark:text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando dados...
      </div>
    );
  }

  const progress = getCategoryProgress(certificates);
  const totals = getTotals(progress);
  const insights = getInsights(progress);

  return (
    <div className="space-y-6">
      <SummaryCards
        approvedHours={totals.approvedHours}
        pendingHours={totals.pendingHours}
        totalRequiredHours={totals.requiredHours}
        remainingHours={totals.remainingHours}
      />

      <section aria-labelledby="progresso-titulo" className="grid gap-4 sm:grid-cols-2">
        <h2 id="progresso-titulo" className="sr-only">
          Progresso por categoria
        </h2>
        {progress.map((category) => (
          <CategoryMeter key={category.key} progress={category} />
        ))}
      </section>

      <InsightsPanel insights={insights} />
    </div>
  );
}
