"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import type { Certificate } from "@/lib/hours/types";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Rejeitar um certificado sempre exige um motivo — é o que o professor vê
 * e o que fica registrado no histórico de status do certificado.
 */
export function RejectCertificateDialog({
  certificate,
  onClose,
  onConfirm,
}: {
  certificate: Certificate | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const dialogRef = useRef<DialogHandle>(null);
  const fieldId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificate) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      setReason("");
      setError(null);
    }
  }, [certificate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Informe o motivo da rejeição.");
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <Dialog
      ref={dialogRef}
      titleId="reject-dialog-title"
      title="Rejeitar certificado"
      onClose={onClose}
      className="max-w-md"
    >
      {certificate && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Você está rejeitando <strong>{certificate.title}</strong>. Explique o motivo — o
            aluno vai ver essa mensagem.
          </p>

          <div>
            <label
              htmlFor={fieldId}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Motivo da rejeição
            </label>
            <textarea
              id={fieldId}
              required
              rows={3}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError(null);
              }}
              placeholder="Ex: carga horária divergente do certificado enviado."
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            {error && (
              <p role="alert" className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                {error}
              </p>
            )}
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
              type="submit"
              className={cn(
                "rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800",
                "dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white",
              )}
            >
              Confirmar rejeição
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
