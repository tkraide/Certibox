import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Acessibilidade: tamanho da fonte, contraste e redução de movimento."
      />

      <div className="card text-sm text-neutral-600 dark:text-neutral-400">
        Em breve: toolbar de acessibilidade (fonte, contraste, redução de movimento).
      </div>
    </>
  );
}
