"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

import type { Certificate } from "@/lib/hours/types";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";

/**
 * Confirmação antes de remover um certificado da lista do aluno — ação
 * destrutiva e sem volta, então nunca acontece direto no clique.
 */
export function RemoveCertificateDialog({
  certificate,
  onClose,
  onConfirm,
}: {
  certificate: Certificate | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<DialogHandle>(null);

  useEffect(() => {
    if (certificate) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [certificate]);

  return (
    <Dialog
      ref={dialogRef}
      titleId="remove-dialog-title"
      title="Remover certificado"
      onClose={onClose}
      className="max-w-sm"
    >
      {certificate && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-3 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Tem certeza que deseja remover <strong>{certificate.title}</strong>? Essa ação não
              pode ser desfeita.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              Remover certificado
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
