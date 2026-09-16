import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Dashboard" };

const CATEGORIES = [
  { name: "Atividades Complementares", required: 90 },
  { name: "Atividades de Extensão", required: 330 },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Acompanhe o progresso das suas horas complementares e de extensão."
      />

      <section
        aria-labelledby="progresso-titulo"
        className="grid gap-4 sm:grid-cols-2"
      >
        <h2 id="progresso-titulo" className="sr-only">
          Progresso por categoria
        </h2>
        {CATEGORIES.map((category) => (
          <article key={category.name} className="card">
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {category.name}
            </h3>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              0h{" "}
              <span className="text-base font-normal text-neutral-600 dark:text-neutral-400">
                de {category.required}h
              </span>
            </p>
            <div
              role="progressbar"
              aria-label={`Progresso em ${category.name}`}
              aria-valuemin={0}
              aria-valuemax={category.required}
              aria-valuenow={0}
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
            >
              <div className="h-full w-0 rounded-full bg-primary-500" />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
