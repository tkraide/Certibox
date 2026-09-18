import { CheckCircle2, Clock } from "lucide-react";

type SummaryCardsProps = {
  approvedHours: number;
  pendingHours: number;
  totalRequiredHours: number;
  remainingHours: number;
};

export function SummaryCards({
  approvedHours,
  pendingHours,
  totalRequiredHours,
  remainingHours,
}: SummaryCardsProps) {
  return (
    <section aria-label="Resumo de horas" className="grid gap-4 sm:grid-cols-2">
      <article className="card flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
          >
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Horas aprovadas
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{approvedHours}h</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              de {totalRequiredHours}h necessárias no total
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Restantes</p>
          <p className="mt-1 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
            {remainingHours}h
          </p>
        </div>
      </article>

      <article className="card flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <Clock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Horas pendentes
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{pendingHours}h</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              aguardando aprovação do professor
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Restantes</p>
          <p className="mt-1 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
            {remainingHours}h
          </p>
        </div>
      </article>
    </section>
  );
}
