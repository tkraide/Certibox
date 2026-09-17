"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Loader2, Search } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { usePendingReviews } from "@/hooks/use-pending-reviews";
import { CATEGORIES, type CategoryKey } from "@/lib/hours/categories";
import { cn } from "@/lib/utils";

type CategoryFilter = "todas" | CategoryKey;
type SortOrder = "nome" | "pendentes";

/**
 * Home do professor: "Gerenciar certificados". Lista os alunos com pelo
 * menos um certificado pendente e, ao lado de cada um, um botão que leva
 * direto pra página de aprovação (o link compartilhável do aluno) — a mesma
 * tela onde o professor já aprova/rejeita certificados.
 *
 * Busca (nome/e-mail), filtro por categoria e ordenação são só client-side —
 * a lista de pendentes já é pequena o bastante pra não precisar ir ao banco
 * de novo a cada mudança de filtro.
 */
export function TeacherReviewContent() {
  const { groups, loaded } = usePendingReviews();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("todas");
  const [sortOrder, setSortOrder] = useState<SortOrder>("nome");

  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = groups.filter((group) => {
      const matchesSearch =
        !query ||
        (group.name ?? "").toLowerCase().includes(query) ||
        group.email.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "todas" || group.pendingByCategory[categoryFilter] > 0;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "pendentes") {
        return b.pendingCount - a.pendingCount || (a.name ?? a.email).localeCompare(b.name ?? b.email);
      }
      return (a.name ?? a.email).localeCompare(b.name ?? b.email);
    });
  }, [groups, search, categoryFilter, sortOrder]);

  const hasActiveFilters = search.trim() !== "" || categoryFilter !== "todas";

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="pendentes-heading" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Alunos com certificados pendentes
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="teacher-review-search" className="sr-only">
                Buscar por nome ou e-mail
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden="true"
                />
                <input
                  id="teacher-review-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome ou e-mail"
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:w-56"
                />
              </div>

              <label htmlFor="teacher-review-category" className="sr-only">
                Filtrar por categoria
              </label>
              <select
                id="teacher-review-category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="todas">Todas as categorias</option>
                {CATEGORIES.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>

              <label htmlFor="teacher-review-sort" className="sr-only">
                Ordenar por
              </label>
              <select
                id="teacher-review-sort"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="nome">Ordenar por nome</option>
                <option value="pendentes">Mais pendentes primeiro</option>
              </select>
            </div>
          </div>

          {visibleGroups.length === 0 ? (
            <p className="mt-6 py-6 text-center text-sm text-neutral-500 dark:text-neutral-500">
              {hasActiveFilters
                ? "Nenhum aluno encontrado com esses filtros."
                : "Nenhum certificado pendente no momento."}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-900">
              {visibleGroups.map((group) => (
                <li
                  key={group.studentId}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 sm:flex-1">
                    <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                      {group.name ?? group.email}
                    </p>
                    <p className="truncate text-sm text-neutral-500 dark:text-neutral-500">
                      {group.email}
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    {CATEGORIES.filter((category) => group.pendingByCategory[category.key] > 0).map(
                      (category) => (
                        <span
                          key={category.key}
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            category.key === "extensao"
                              ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                          )}
                        >
                          {group.pendingByCategory[category.key]} {category.label}
                        </span>
                      ),
                    )}
                    <Link
                      href={`/certificados/compartilhado/${group.shareToken}`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 sm:ml-0"
                    >
                      Revisar
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
