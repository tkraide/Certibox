import type { CategoryProgress } from "@/lib/hours/aggregate";
import { getCategoryConfig } from "@/lib/hours/categories";
import type { Certificate } from "@/lib/hours/types";
import type { createClient } from "@/lib/supabase/client";
import { getCertificateFileUrl } from "@/lib/supabase/certificates";

type SupabaseClient = ReturnType<typeof createClient>;

const STATUS_LABEL: Record<Certificate["status"], string> = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  rejeitado: "Rejeitado",
};

export type ReportPdfInput = {
  studentEmail?: string;
  studentName?: string;
  progress: CategoryProgress[];
  certificates: Certificate[];
};

/**
 * Monta o PDF do relatório inteiramente com texto (jsPDF puro, sem
 * "fotografar" a tela com html2canvas). Isso evita os problemas que
 * tínhamos com a captura de tela: páginas cortadas (o relatório é exibido
 * dentro de um modal com rolagem própria) e imagens saindo em branco
 * (canvas "sujo" por CORS, e <iframe> de PDF que o html2canvas não
 * consegue capturar de jeito nenhum).
 *
 * As imagens/arquivos originais dos certificados vão à parte, dentro de um
 * .zip (ver buildCertificatesZipBlob) — o PDF só referencia o nome de cada
 * arquivo dentro do zip.
 */
export async function buildReportPdfBlob({
  studentEmail,
  studentName,
  progress,
  certificates,
}: ReportPdfInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 48;
  let y = 56;

  function ensureSpace(nextLineHeight: number) {
    if (y + nextLineHeight > bottomLimit) {
      pdf.addPage();
      y = 56;
    }
  }

  function writeParagraph(
    text: string,
    options: {
      size?: number;
      style?: "normal" | "bold" | "italic";
      lineHeight?: number;
      spacingAfter?: number;
    } = {},
  ) {
    const { size = 10, style = "normal", lineHeight = 14, spacingAfter = 8 } = options;
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      pdf.text(line, marginX, y);
      y += lineHeight;
    }
    y += spacingAfter;
  }

  const generatedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  writeParagraph("Relatório de Horas Complementares e de Extensão", {
    size: 16,
    style: "bold",
    lineHeight: 20,
    spacingAfter: 6,
  });
  writeParagraph(`Aluno: ${studentName ? `${studentName} — ` : ""}${studentEmail ?? "—"}`, {
    spacingAfter: 2,
  });
  writeParagraph(`Emitido em ${generatedAt}`, { spacingAfter: 16 });

  writeParagraph(
    "Este relatório resume as horas complementares e de extensão do(a) aluno(a) acima junto à " +
      "UFSCar, com base nos certificados enviados pelo CertiBox e seus respectivos status de " +
      "aprovação. Os arquivos originais dos certificados seguem em anexo, compactados em um " +
      "arquivo .zip.",
    { spacingAfter: 18 },
  );

  writeParagraph("Resumo por categoria", { size: 13, style: "bold", spacingAfter: 8 });
  for (const category of progress) {
    writeParagraph(
      `${category.label}: ${category.approvedHours}h aprovadas, ${category.pendingHours}h ` +
        `pendentes, de ${category.requiredHours}h necessárias (restam ${category.remainingHours}h).`,
      { spacingAfter: 4 },
    );
  }
  y += 10;

  writeParagraph(`Certificados (${certificates.length})`, {
    size: 13,
    style: "bold",
    spacingAfter: 8,
  });

  if (certificates.length === 0) {
    writeParagraph("Nenhum certificado enviado ainda.");
  } else {
    certificates.forEach((certificate, index) => {
      writeParagraph(`${index + 1}. ${certificate.title}`, {
        size: 10.5,
        style: "bold",
        spacingAfter: 2,
      });
      writeParagraph(
        `${getCategoryConfig(certificate.category).label} · ${certificate.hours}h · ` +
          `${STATUS_LABEL[certificate.status]} · arquivo no .zip: ${zipEntryName(certificate, index)}`,
        { size: 9.5, spacingAfter: 10 },
      );
    });
  }

  return pdf.output("blob");
}

/** Nome de arquivo usado dentro do .zip — referenciado também no texto do PDF. */
function zipEntryName(certificate: Certificate, index: number): string {
  const extension = extensionFor(certificate);
  return `${String(index + 1).padStart(2, "0")}-${sanitizeFileName(certificate.title)}${extension}`;
}

function extensionFor(certificate: Certificate): string {
  if (certificate.fileType === "pdf") return ".pdf";
  const match = certificate.fileName.match(/\.[a-zA-Z0-9]+$/);
  return match?.[0]?.toLowerCase() ?? ".jpg";
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned.slice(0, 60) || "certificado";
}

/**
 * Baixa o arquivo de cada certificado (via signed URL do Storage, já que o
 * bucket é privado) e monta um .zip com todos — é o que garante que o
 * professor recebe os certificados de verdade (imagens e PDFs originais),
 * já que o PDF do relatório em si só traz texto.
 *
 * Retorna null se não houver certificados (não faz sentido anexar um zip
 * vazio).
 */
export async function buildCertificatesZipBlob(
  certificates: Certificate[],
  supabase: SupabaseClient,
): Promise<Blob | null> {
  if (certificates.length === 0) return null;

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  await Promise.all(
    certificates.map(async (certificate, index) => {
      const signedUrl = await getCertificateFileUrl(supabase, certificate.filePath);
      if (!signedUrl) return;

      const response = await fetch(signedUrl);
      if (!response.ok) return;

      const arrayBuffer = await response.arrayBuffer();
      zip.file(zipEntryName(certificate, index), arrayBuffer);
    }),
  );

  return zip.generateAsync({ type: "blob" });
}

/**
 * Dispara o download de um Blob no navegador (link temporário + clique
 * programático) — usado tanto para o PDF quanto para o .zip de certificados,
 * já que ambos vêm como Blob (o mesmo conteúdo que é anexado ao e-mail).
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
