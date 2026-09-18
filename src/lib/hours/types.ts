import type { CategoryKey } from "./categories";

export type CertificateStatus = "aprovado" | "pendente" | "rejeitado";
export type CertificateFileType = "imagem" | "pdf";

/**
 * Certificado, já traduzido das colunas em português da tabela
 * "certificates" do Supabase (titulo, carga_horaria, aluno_id, ...) para o
 * formato usado pelo front-end.
 *
 * O histórico de status (quem mudou, quando, motivo da rejeição) não vive
 * mais aqui dentro — fica na tabela "certificate_logs" e é buscado sob
 * demanda (ver `getLatestRejectionReason` em `@/lib/supabase/certificates`).
 */
export type Certificate = {
  id: string;
  /** aluno_id — dono do certificado; usado pelo link compartilhável. */
  studentId: string;
  title: string;
  category: CategoryKey;
  hours: number;
  /** Data em que a atividade ocorreu (YYYY-MM-DD), não a data de envio. */
  activityDate: string;
  status: CertificateStatus;
  fileType: CertificateFileType;
  /** Caminho do objeto no Supabase Storage (bucket "certificados") — não é uma URL pronta. */
  filePath: string;
  fileName: string;
  /** Data/hora de envio (created_at). */
  uploadedAt: string;
  /**
   * Código público do comprovante verificável (codigo_verificacao) — só
   * existe depois que o certificado é aprovado. É o que vira o link/QR code
   * em `/verificar/[codigo]`, uma página sem login que confirma a aprovação
   * para quem recebe o comprovante (ex.: recrutador de estágio).
   */
  verificationCode: string | null;
};
