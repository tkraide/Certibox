"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useCertificates } from "@/hooks/use-certificates";
import { useStudentOnly } from "@/hooks/use-student-only";
import { getCategoryProgress } from "@/lib/hours/aggregate";
import { downloadCertificatesCsv } from "@/lib/hours/export-csv";

import { ReportDialog } from "./report-dialog";

export function RelatoriosPageContent() {
  const { blocked } = useStudentOnly();
  const { user } = useAuth();
  const { certificates, loaded } = useCertificates();
  const progress = getCategoryProgress(certificates);

  const [reportOpen, setReportOpen] = useState(false);

  // Página exclusiva de aluno — professor é redirecionado pra "Gerenciar
  // certificados" (ver useStudentOnly).
  if (blocked) return null;

  if (!loaded) {
    return (
      <div className="card flex items-center justify-center gap-2 py-10 text-sm text-neutral-500 dark:text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando dados...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Relatório de horas
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Título, identificação do aluno, texto explicativo e os certificados anexados —
              pronto para imprimir ou salvar como PDF e enviar por e-mail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Gerar relatório
          </button>
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Exportar dados
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Lista de certificados com categoria, carga horária e status em CSV — abre
              diretamente no Excel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadCertificatesCsv(certificates)}
            disabled={certificates.length === 0}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            Exportar CSV/Excel
          </button>
        </div>

        {certificates.length === 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Envie certificados em &ldquo;Meus certificados&rdquo; para gerar um relatório ou
            exportação com dados.
          </p>
        )}
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        studentEmail={user?.email}
        studentName={user?.name}
        certificates={certificates}
        progress={progress}
      />
    </>
  );
}
