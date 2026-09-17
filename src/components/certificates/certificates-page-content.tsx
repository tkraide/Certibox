"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { useCertificates } from "@/hooks/use-certificates";
import { useStudentOnly } from "@/hooks/use-student-only";
import { getCategoryProgress } from "@/lib/hours/aggregate";
import { getCategoryConfig, type CategoryKey } from "@/lib/hours/categories";
import type { Certificate } from "@/lib/hours/types";
import { PageHeader } from "@/components/layout/page-header";

import { CertificateList } from "./certificate-list";
import { CertificateViewerDialog } from "./certificate-viewer-dialog";
import { RemoveCertificateDialog } from "./remove-certificate-dialog";
import { ShareLinkButton } from "./share-link-button";
import { UploadDialog } from "./upload-dialog";

// Extensão sempre acima, Complementares sempre abaixo — separados por uma
// linha horizontal na lista.
const CATEGORY_SECTIONS: CategoryKey[] = ["extensao", "complementares"];

export function CertificatesPageContent() {
  const { blocked } = useStudentOnly();
  const { certificates, loaded, addCertificate, removeCertificate } = useCertificates();
  const progress = getCategoryProgress(certificates);

  const [viewing, setViewing] = useState<Certificate | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removing, setRemoving] = useState<Certificate | null>(null);

  // Página exclusiva de aluno — professor é redirecionado pra "Gerenciar
  // certificados" (ver useStudentOnly); evita renderizar o conteúdo por um
  // instante enquanto o redirecionamento acontece.
  if (blocked) return null;

  return (
    <>
      <PageHeader
        title="Meus certificados"
        description="Envie seus certificados e acompanhe o status de aprovação."
        action={
          <div className="flex flex-wrap gap-2">
            <ShareLinkButton />
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar certificado
            </button>
          </div>
        }
      />

      <p className="-mt-4 mb-6 text-xs text-neutral-500 dark:text-neutral-500">
        O link copiado em <strong>Gerar link compartilhável</strong> abre a página de aprovação —
        é o que você envia para o professor revisar e aprovar ou rejeitar seus certificados.
      </p>

      {!loaded ? (
        <div className="card flex items-center justify-center gap-2 py-10 text-sm text-neutral-500 dark:text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando certificados...
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORY_SECTIONS.map((categoryKey, index) => (
            <div key={categoryKey}>
              {index > 0 && (
                <hr className="mb-6 border-neutral-200 dark:border-neutral-800" />
              )}
              <section aria-labelledby={`${categoryKey}-heading`} className="space-y-3">
                <h2
                  id={`${categoryKey}-heading`}
                  className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {getCategoryConfig(categoryKey).label}
                </h2>
                <CertificateList
                  certificates={certificates.filter((certificate) => certificate.category === categoryKey)}
                  onSelect={setViewing}
                  renderActions={(certificate) => (
                    <button
                      type="button"
                      onClick={() => setRemoving(certificate)}
                      className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Remover
                    </button>
                  )}
                />
              </section>
            </div>
          ))}
        </div>
      )}

      <CertificateViewerDialog certificate={viewing} onClose={() => setViewing(null)} />
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        progress={progress}
        onSaved={addCertificate}
      />
      <RemoveCertificateDialog
        certificate={removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) removeCertificate(removing);
          setRemoving(null);
        }}
      />
    </>
  );
}
