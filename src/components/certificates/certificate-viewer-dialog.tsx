"use client";

import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { getCategoryConfig } from "@/lib/hours/categories";
import { getLatestRejectionReason } from "@/lib/supabase/certificates";
import type { Certificate } from "@/lib/hours/types";
import { useCertificateFileUrl } from "@/hooks/use-certificate-file-url";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";

import { CertificateStatusBadge } from "./certificate-status-badge";
import { VerificationQr } from "./verification-qr";

/**
 * Visualização em tela cheia (clique na miniatura). O conteúdo de dentro de
 * #certibox-print-area é o único que sobrevive no modo de impressão — ver a
 * regra @media print em globals.css.
 */
export function CertificateViewerDialog({
  certificate,
  onClose,
}: {
  certificate: Certificate | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<DialogHandle>(null);
  const supabase = createClient();
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const fileUrl = useCertificateFileUrl(certificate?.filePath ?? null);

  useEffect(() => {
    if (certificate) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [certificate]);

  useEffect(() => {
    setRejectionReason(null);
    if (certificate?.status === "rejeitado") {
      getLatestRejectionReason(supabase, certificate.id).then(setRejectionReason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate?.id, certificate?.status]);

  return (
    <Dialog
      ref={dialogRef}
      titleId="certificate-viewer-title"
      title={certificate?.title ?? "Certificado"}
      onClose={onClose}
      className="max-w-3xl"
    >
      {certificate && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <CertificateStatusBadge status={certificate.status} />
            <span aria-hidden="true">·</span>
            <span>{certificate.hours}h</span>
            <span aria-hidden="true">·</span>
            <span>{getCategoryConfig(certificate.category).label}</span>
          </div>

          {certificate.status === "rejeitado" && rejectionReason && (
            <div className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              <strong>Motivo da rejeição:</strong> {rejectionReason}
            </div>
          )}

          <div
            id="certibox-print-area"
            className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900"
          >
            {!fileUrl ? (
              <div className="flex h-[65vh] items-center justify-center text-sm text-neutral-500 dark:text-neutral-500">
                Carregando arquivo...
              </div>
            ) : certificate.fileType === "imagem" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt={`Certificado: ${certificate.title}`}
                className="mx-auto max-h-[65vh] w-auto rounded"
              />
            ) : (
              <iframe
                src={fileUrl}
                title={`Certificado: ${certificate.title}`}
                className="h-[65vh] w-full rounded"
              />
            )}
          </div>

          {certificate.status === "aprovado" && certificate.verificationCode && (
            <VerificationQr code={certificate.verificationCode} />
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Imprimir
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
