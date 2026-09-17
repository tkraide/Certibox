"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import type { Certificate } from "@/lib/hours/types";

/**
 * Botões de aprovar/rejeitar exibidos para o professor (logado com e-mail
 * @ufscar.br) na página compartilhada. Só aparecem em certificados ainda
 * pendentes — os já resolvidos mostram apenas o status.
 */
export function CertificateReviewActions({
  certificate,
  onApprove,
  onReject,
}: {
  certificate: Certificate;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (certificate.status !== "pendente") return null;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onApprove}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-2.5 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-primary-400"
      >
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Aprovar
      </button>
      <button
        type="button"
        onClick={onReject}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Rejeitar
      </button>
    </div>
  );
}
