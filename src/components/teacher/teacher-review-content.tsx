"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { usePendingReviews } from "@/hooks/use-pending-reviews";

/**
 * Home do professor: "Gerenciar certificados". Lista os alunos com pelo
 * menos um certificado pendente e, ao lado de cada um, um botão que leva
 * direto pra página de aprovação (o link compartilhável do aluno) — a mesma
 * tela onde o professor já aprova/rejeita certificados.
 */
export function TeacherReviewContent() {
  const { groups, loaded } = usePendingReviews();

  return (
    <>
      <PageHeader
        title="Gerenciar certificados"
        description="Alunos com certificados aguardando aprovação ou reprovação."
      />

      {!loaded ? (
        <div className="card flex items-center justify-center gap-2 py-10 text-sm text-neutral-500 dark:text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando certificados pendentes...
        </div>
      ) : groups.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-10 text-center text-sm text-neutral-500 dark:text-neutral-500">
          <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
          <p>Nenhum certificado pendente no momento. Tudo revisado!</p>
        </div>
      ) : (
        <section aria-labelledby="pendentes-heading" className="card">
          <h2 id="pendentes-heading" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Alunos com certificados pendentes
          </h2>

          <ul className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-900">
            {groups.map((group) => (
              <li
                key={group.studentId}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                    {group.name ?? group.email}
                  </p>
                  <p className="truncate text-sm text-neutral-500 dark:text-neutral-500">
                    {group.email}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                    {group.pendingCount} pendente{group.pendingCount > 1 ? "s" : ""}
                  </span>
                  <Link
                    href={`/certificados/compartilhado/${group.shareToken}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    Revisar
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
