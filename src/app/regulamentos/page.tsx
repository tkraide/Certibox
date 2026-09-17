import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Regulamentos" };

const REGULATIONS = [
  {
    key: "extensao",
    title: "Regulamento de Atividades de Extensão",
    description:
      "Normas que definem o que conta como Atividade de Extensão e como validar as 330h da categoria.",
    href: "http://www.dcomp.ufscar.br/wp-content/uploads/2020/08/Regulamento-AtivExtens%C3%A3o-2018-v2.pdf",
  },
  {
    key: "complementares",
    title: "Regulamento de Atividades Complementares",
    description:
      "Normas que definem o que conta como Atividade Complementar e como validar as 90h da categoria.",
    href: "http://www.dcomp.ufscar.br/wp-content/uploads/2020/08/RegulamentoAtivComplementar_Cur2018_v2_2020.pdf",
  },
] as const;

export default function RegulamentosPage() {
  return (
    <>
      <PageHeader
        title="Regulamentos"
        description="Baixe os regulamentos oficiais de horas complementares e de extensão da UFSCar (DComp)."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {REGULATIONS.map((regulation) => (
          <article key={regulation.key} className="card flex flex-col gap-4">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
            >
              <FileText className="h-6 w-6" />
            </span>

            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {regulation.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {regulation.description}
              </p>
            </div>

            <a
              href={regulation.href}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400 focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Baixar PDF
            </a>
          </article>
        ))}
      </div>
    </>
  );
}
