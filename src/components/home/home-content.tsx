"use client";

import Link from "next/link";
import { FileBadge, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { TeacherReviewContent } from "@/components/teacher/teacher-review-content";
import { useAuth } from "@/hooks/use-auth";

/**
 * Conteúdo da rota "/" — a home muda de acordo com o papel do usuário
 * logado: aluno vê o Dashboard de horas de sempre, professor vê a tela de
 * "Gerenciar certificados" (lista de alunos com certificados pendentes).
 */
export function HomeContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="card flex items-center justify-center gap-2 py-10 text-sm text-neutral-500 dark:text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando...
      </div>
    );
  }

  if (user?.role === "professor") {
    return <TeacherReviewContent />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Acompanhe o progresso das suas horas complementares e de extensão."
        action={
          <Link
            href="/certificados"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <FileBadge className="h-4 w-4" aria-hidden="true" />
            Adicionar certificados
          </Link>
        }
      />

      <DashboardContent />
    </>
  );
}
