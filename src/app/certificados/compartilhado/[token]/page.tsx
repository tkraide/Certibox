import type { Metadata } from "next";

import { SharedCertificatesContent } from "@/components/certificates/shared-certificates-content";

export const metadata: Metadata = { title: "Certificados compartilhados" };

export default async function CertificadosCompartilhadosPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SharedCertificatesContent token={token} />;
}
