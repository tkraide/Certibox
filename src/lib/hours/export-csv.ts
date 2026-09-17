import { getCategoryConfig } from "./categories";
import type { Certificate, CertificateStatus } from "./types";

const STATUS_LABEL: Record<CertificateStatus, string> = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  rejeitado: "Rejeitado",
};

function escapeCsvValue(value: string): string {
  if (/[",;\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Usa ";" como separador (não ","), porque é o que o Excel em pt-BR espera
 * — nessa localidade a vírgula já é o separador decimal.
 */
export function buildCertificatesCsv(certificates: Certificate[]): string {
  const header = ["Título", "Categoria", "Carga horária (h)", "Status", "Enviado em", "Arquivo"];

  const rows = certificates.map((certificate) => [
    certificate.title,
    getCategoryConfig(certificate.category).label,
    String(certificate.hours),
    STATUS_LABEL[certificate.status],
    new Date(certificate.uploadedAt).toLocaleDateString("pt-BR"),
    certificate.fileName,
  ]);

  const lines = [header, ...rows].map((row) => row.map(escapeCsvValue).join(";"));

  // BOM no início para o Excel reconhecer UTF-8 e não quebrar os acentos.
  return "﻿" + lines.join("\r\n");
}

export function downloadCertificatesCsv(certificates: Certificate[]) {
  const csv = buildCertificatesCsv(certificates);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `certibox-certificados-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
