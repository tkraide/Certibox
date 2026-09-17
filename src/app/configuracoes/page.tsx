import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SettingsPageContent } from "@/components/settings/settings-page-content";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Seu perfil e as opções de acessibilidade do CertiBox."
      />

      <SettingsPageContent />
    </>
  );
}
