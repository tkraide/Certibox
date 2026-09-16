import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Meus Certificados" };

export default function CertificadosPage() {
  return (
    <>
      <PageHeader
        title="Meus Certificados"
        description="Envie, acompanhe e compartilhe seus certificados."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Adicionar certificado
          </button>
        }
      />

      <div className="card text-sm text-neutral-600 dark:text-neutral-400">
        Nenhum certificado enviado ainda.
      </div>
    </>
  );
}
