import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Relatórios" };

export default function RelatoriosPage() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Gere relatórios em PDF para impressão ou e-mail e exporte seus dados em CSV/Excel."
      />

      <div className="card text-sm text-neutral-600 dark:text-neutral-400">
        Em breve: geração de relatório e exportação de dados.
      </div>
    </>
  );
}
