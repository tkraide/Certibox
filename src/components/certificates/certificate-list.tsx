"use client";

import type { ReactNode } from "react";

import type { Certificate } from "@/lib/hours/types";
import { getCategoryConfig } from "@/lib/hours/categories";

import { CertificateStatusBadge } from "./certificate-status-badge";
import { CertificateThumbnail } from "./certificate-thumbnail";

export function CertificateList({
  certificates,
  onSelect,
  renderActions,
  actionsPlacement = "inline",
}: {
  certificates: Certificate[];
  onSelect: (certificate: Certificate) => void;
  /** Slot opcional associado ao status de cada certificado. */
  renderActions?: (certificate: Certificate) => ReactNode;
  /**
   * "inline" (padrão): a ação fica ao lado do status (ex.: botão "Remover"
   * em "Meus certificados").
   * "stacked": a ação fica abaixo do status, ocupando a largura do card —
   * usado quando há mais de um botão lado a lado (Aprovar/Rejeitar na tela
   * do professor), evitando que eles ultrapassem o card.
   */
  actionsPlacement?: "inline" | "stacked";
}) {
  if (certificates.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-1 py-10 text-center text-sm text-neutral-500 dark:text-neutral-500">
        <p>Você ainda não enviou nenhum certificado.</p>
        <p>Use o botão &ldquo;Adicionar certificado&rdquo; para começar.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {certificates.map((certificate) => (
        <li key={certificate.id} className="card flex flex-col gap-3">
          <CertificateThumbnail
            certificate={certificate}
            onClick={() => onSelect(certificate)}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {certificate.title}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-500">
              {getCategoryConfig(certificate.category).label} · {certificate.hours}h
            </p>
          </div>
          <div
            className={
              actionsPlacement === "stacked"
                ? "flex flex-col gap-2"
                : "flex items-center justify-between gap-2"
            }
          >
            <CertificateStatusBadge status={certificate.status} />
            {renderActions?.(certificate)}
          </div>
        </li>
      ))}
    </ul>
  );
}
