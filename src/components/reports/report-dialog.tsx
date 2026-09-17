"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Archive, CheckCircle2, FileDown, Loader2, Mail } from "lucide-react";

import type { CategoryProgress } from "@/lib/hours/aggregate";
import { getCategoryConfig } from "@/lib/hours/categories";
import type { Certificate } from "@/lib/hours/types";
import {
  buildCertificatesZipBlob,
  buildReportPdfBlob,
  downloadBlob,
} from "@/lib/hours/generate-report-pdf";
import { useCertificateFileUrl } from "@/hooks/use-certificate-file-url";
import { createClient } from "@/lib/supabase/client";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { CertificateStatusBadge } from "../certificates/certificate-status-badge";

const STATUS_LABEL: Record<Certificate["status"], string> = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  rejeitado: "Rejeitado",
};

type ReportDialogProps = {
  open: boolean;
  onClose: () => void;
  studentEmail?: string;
  studentName?: string;
  certificates: Certificate[];
  progress: CategoryProgress[];
};

type ActionFeedback = { type: "success" | "error"; message: string };

/** Estilo compartilhado pelos três botões de ação — todos igualmente destacados. */
const ACTION_BUTTON_CLASS =
  "inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50";

/** Resolve a signed URL do arquivo de UM certificado — cada item da lista tem a sua. */
function ReportCertificateFile({ certificate }: { certificate: Certificate }) {
  const fileUrl = useCertificateFileUrl(certificate.filePath);

  if (!fileUrl) {
    return (
      <p className="p-4 text-center text-xs text-neutral-500 dark:text-neutral-500">
        Carregando arquivo...
      </p>
    );
  }

  return certificate.fileType === "imagem" ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fileUrl}
      alt={`Certificado: ${certificate.title}`}
      className="mx-auto max-h-72 w-auto rounded"
    />
  ) : (
    <iframe
      src={fileUrl}
      title={`Certificado: ${certificate.title}`}
      className="h-56 w-full rounded"
    />
  );
}

/**
 * Visualização do relatório: título, identificação do aluno, texto
 * explicativo e as imagens/informações de cada certificado, para conferência
 * na tela.
 *
 * As três ações (baixar PDF, baixar .zip dos certificados e enviar ao
 * professor) usam o mesmo conteúdo: um PDF só com texto (resumo por
 * categoria + lista de certificados) e um .zip com os arquivos originais dos
 * certificados — gerados por buildReportPdfBlob/buildCertificatesZipBlob em
 * generate-report-pdf.ts. "Enviar ao Professor" manda os dois por e-mail; os
 * outros dois botões baixam o mesmo PDF/.zip diretamente.
 */
export function ReportDialog({
  open,
  onClose,
  studentEmail,
  studentName,
  certificates,
  progress,
}: ReportDialogProps) {
  const dialogRef = useRef<DialogHandle>(null);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      setDownloadingPdf(false);
      setDownloadingZip(false);
      setSending(false);
      setFeedback(null);
    }
  }, [open]);

  const generatedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    setFeedback(null);

    try {
      const pdfBlob = await buildReportPdfBlob({ studentEmail, studentName, progress, certificates });
      downloadBlob(pdfBlob, "relatorio-horas.pdf");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível gerar o PDF.",
      });
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDownloadZip() {
    if (certificates.length === 0) return;

    setDownloadingZip(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const zipBlob = await buildCertificatesZipBlob(certificates, supabase);
      if (!zipBlob) {
        throw new Error("Nenhum certificado para baixar.");
      }
      downloadBlob(zipBlob, "certificados.zip");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível gerar o .zip.",
      });
    } finally {
      setDownloadingZip(false);
    }
  }

  async function handleSendToProfessor() {
    if (!studentEmail) return;

    setSending(true);
    setFeedback(null);

    try {
      // PDF só com texto (sem "fotografar" a tela) + um .zip com os
      // arquivos originais dos certificados — mais simples e confiável do
      // que tentar embutir as imagens/PDFs dos certificados dentro do PDF
      // do relatório (ver histórico: páginas cortadas e imagens em branco).
      const supabase = createClient();
      const [pdfBlob, zipBlob] = await Promise.all([
        buildReportPdfBlob({ studentEmail, studentName, progress, certificates }),
        buildCertificatesZipBlob(certificates, supabase),
      ]);

      // Envio como multipart/form-data (não JSON): os arquivos vão "crus"
      // (binário), sem o custo extra de converter tudo pra base64 antes.
      const formData = new FormData();
      // Protótipo: ainda não existe um cadastro de professor responsável por
      // aluno, então o e-mail é enviado para o próprio e-mail do usuário
      // logado — dá pra conferir a mensagem recebida nesta fase.
      formData.set("to", studentEmail);
      formData.set("studentEmail", studentEmail);
      if (studentName) formData.set("studentName", studentName);
      formData.set("pdf", pdfBlob, "relatorio-horas.pdf");
      if (zipBlob) formData.set("zip", zipBlob, "certificados.zip");

      const response = await fetch("/api/send-report", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error ?? "Não foi possível enviar o e-mail. Tente novamente.");
      }

      setFeedback({
        type: "success",
        message: `Relatório enviado para ${studentEmail}.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o e-mail. Tente novamente.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      ref={dialogRef}
      titleId="report-dialog-title"
      title="Relatório de horas"
      onClose={onClose}
      className="max-w-3xl"
    >
      <div id="certibox-print-area" className="space-y-6">
        <header className="space-y-1 border-b border-neutral-200 pb-4 dark:border-neutral-800">
          <h1 className="text-xl font-semibold tracking-tight">
            Relatório de Horas Complementares e de Extensão
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Aluno: <strong className="text-neutral-900 dark:text-neutral-100">{studentEmail ?? "—"}</strong>
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Emitido em {generatedAt}</p>
        </header>

        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          Este relatório resume as horas complementares e de extensão do(a) aluno(a) acima junto
          à UFSCar, com base nos certificados enviados pelo CertiBox e seus respectivos status de
          aprovação. Os certificados relacionados abaixo estão anexados com suas imagens e
          informações.
        </p>

        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Resumo por categoria
          </h2>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                <th className="py-1.5 pr-3 font-medium">Categoria</th>
                <th className="py-1.5 pr-3 font-medium">Aprovadas</th>
                <th className="py-1.5 pr-3 font-medium">Pendentes</th>
                <th className="py-1.5 font-medium">Meta</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((category) => (
                <tr key={category.key} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="py-1.5 pr-3 text-neutral-900 dark:text-neutral-100">
                    {category.label}
                  </td>
                  <td className="py-1.5 pr-3">{category.approvedHours}h</td>
                  <td className="py-1.5 pr-3">{category.pendingHours}h</td>
                  <td className="py-1.5">{category.requiredHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="certibox-print-hide space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className={ACTION_BUTTON_CLASS}
            >
              {downloadingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileDown className="h-4 w-4" aria-hidden="true" />
              )}
              {downloadingPdf ? "Gerando PDF..." : "Imprimir / Salvar como PDF"}
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip || certificates.length === 0}
              className={ACTION_BUTTON_CLASS}
            >
              {downloadingZip ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Archive className="h-4 w-4" aria-hidden="true" />
              )}
              {downloadingZip ? "Compactando..." : "Baixar certificados (.zip)"}
            </button>

            <button
              type="button"
              onClick={handleSendToProfessor}
              disabled={sending || !studentEmail}
              className={ACTION_BUTTON_CLASS}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="h-4 w-4" aria-hidden="true" />
              )}
              {sending ? "Enviando..." : "Enviar ao Professor"}
            </button>
          </div>

          {feedback && (
            <p
              role="status"
              className={cn(
                "flex items-start gap-1.5 text-xs",
                feedback.type === "success"
                  ? "text-primary-700 dark:text-primary-400"
                  : "text-red-700 dark:text-red-400",
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              {feedback.message}
            </p>
          )}

          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            O PDF traz o resumo por categoria e a lista de certificados; o .zip traz os arquivos
            originais dos certificados — é o mesmo conteúdo enviado por e-mail ao clicar em
            &quot;Enviar ao Professor&quot;. Protótipo: como ainda não há cadastro de professor
            responsável por aluno, o e-mail é enviado para o seu próprio endereço (
            {studentEmail ?? "—"}), pra você conferir a mensagem recebida.
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Certificados ({certificates.length})
          </h2>

          {certificates.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
              Nenhum certificado enviado ainda.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              {certificates.map((certificate) => (
                <article
                  key={certificate.id}
                  className="break-inside-avoid rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {certificate.title}
                    </h3>
                    <CertificateStatusBadge status={certificate.status} />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                    {getCategoryConfig(certificate.category).label} · {certificate.hours}h ·{" "}
                    {STATUS_LABEL[certificate.status]}
                  </p>

                  <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
                    <ReportCertificateFile certificate={certificate} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Dialog>
  );
}
