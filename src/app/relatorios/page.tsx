import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { RelatoriosPageContent } from "@/components/reports/relatorios-page-content";

export const metadata: Metadata = { title: "Relatórios" };

export default function RelatoriosPage() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Gere relatórios em PDF para impressão ou e-mail e exporte seus dados em CSV/Excel."
      />

      <RelatoriosPageContent />
    </>
  );
}
