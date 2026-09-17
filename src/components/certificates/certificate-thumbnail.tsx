"use client";

import { FileText, Loader2 } from "lucide-react";

import type { Certificate } from "@/lib/hours/types";
import { useCertificateFileUrl } from "@/hooks/use-certificate-file-url";
import { cn } from "@/lib/utils";

export function CertificateThumbnail({
  certificate,
  onClick,
  className,
}: {
  certificate: Certificate;
  onClick?: () => void;
  className?: string;
}) {
  // PDF usa um ícone fixo (sem preview), então só resolve signed URL pra imagem.
  const fileUrl = useCertificateFileUrl(
    certificate.fileType === "imagem" ? certificate.filePath : null,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver certificado "${certificate.title}" em tela cheia`}
      className={cn(
        "group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 transition-colors hover:border-primary-300 focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {certificate.fileType === "imagem" ? (
        fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={`Miniatura do certificado ${certificate.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Loader2
            className="h-5 w-5 animate-spin text-neutral-400 dark:text-neutral-600"
            aria-hidden="true"
          />
        )
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
          <FileText className="h-8 w-8" aria-hidden="true" />
          <span className="text-[11px] font-medium">PDF</span>
        </div>
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-neutral-950/0 transition-colors group-hover:bg-neutral-950/5 dark:group-hover:bg-white/5"
      />
    </button>
  );
}
