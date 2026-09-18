import type { Metadata } from "next";

import { VerificationPageContent } from "@/components/certificates/verification-page-content";

export const metadata: Metadata = { title: "Verificar certificado" };

/**
 * Página pública do comprovante verificável — sem login, sem moldura do app
 * (ver CHROMELESS_ROUTES em app-shell.tsx e PUBLIC_ROUTES em middleware.ts).
 * O código vem da URL (gerado só na aprovação, ver
 * `alterar_status_certificado` na migration `add_certificate_verification_code`)
 * e a consulta em si roda no client (ver VerificationPageContent).
 */
export default async function VerificarCertificadoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <VerificationPageContent code={codigo} />;
}
