import type { Metadata } from "next";

import { CertificatesPageContent } from "@/components/certificates/certificates-page-content";

export const metadata: Metadata = { title: "Meus Certificados" };

export default function CertificadosPage() {
  return <CertificatesPageContent />;
}
