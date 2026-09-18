import type { createClient } from "@/lib/supabase/client";
import type { CategoryKey } from "@/lib/hours/categories";
import type {
  Certificate,
  CertificateFileType,
  CertificateStatus,
} from "@/lib/hours/types";

type SupabaseClient = ReturnType<typeof createClient>;

const BUCKET = "certificados";

type CertificateRow = {
  id: string;
  aluno_id: string;
  categoria_id: string;
  titulo: string;
  carga_horaria: number;
  data_atividade: string;
  arquivo_url: string;
  arquivo_nome: string;
  tipo_arquivo: CertificateFileType;
  status: CertificateStatus;
  created_at: string;
  updated_at: string;
  codigo_verificacao: string | null;
};

// Cache em memória (módulo) do mapeamento chave <-> id da categoria — só
// existem 2 linhas e praticamente nunca mudam, não vale a pena buscar de
// novo a cada chamada.
let categoryIdsCache: Record<CategoryKey, string> | null = null;

async function getCategoryIds(supabase: SupabaseClient): Promise<Record<CategoryKey, string>> {
  if (categoryIdsCache) return categoryIdsCache;

  const { data, error } = await supabase.from("categories").select("id, chave");
  if (error) throw error;

  const map = Object.fromEntries(
    (data ?? []).map((row) => [row.chave as CategoryKey, row.id as string]),
  ) as Record<CategoryKey, string>;

  categoryIdsCache = map;
  return map;
}

function mapRow(row: CertificateRow, categoryKey: CategoryKey): Certificate {
  return {
    id: row.id,
    studentId: row.aluno_id,
    title: row.titulo,
    category: categoryKey,
    hours: row.carga_horaria,
    activityDate: row.data_atividade,
    status: row.status,
    fileType: row.tipo_arquivo,
    filePath: row.arquivo_url,
    fileName: row.arquivo_nome,
    uploadedAt: row.created_at,
    verificationCode: row.codigo_verificacao,
  };
}

async function mapRows(supabase: SupabaseClient, rows: CertificateRow[]): Promise<Certificate[]> {
  const idsByKey = await getCategoryIds(supabase);
  const keyById = new Map<string, CategoryKey>(
    (Object.entries(idsByKey) as [CategoryKey, string][]).map(([key, id]) => [id, key]),
  );
  return rows.map((row) => mapRow(row, keyById.get(row.categoria_id) ?? "complementares"));
}

/** Certificados de UM aluno específico (usado tanto em "Meus certificados" quanto no link compartilhável). */
export async function listCertificatesByStudent(
  supabase: SupabaseClient,
  studentId: string,
): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("aluno_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return mapRows(supabase, (data ?? []) as CertificateRow[]);
}

/** Um aluno com pelo menos um certificado pendente, para a home do professor. */
export type PendingReviewGroup = {
  studentId: string;
  name: string | null;
  email: string;
  /** Token do link compartilhável do aluno — leva direto pra página de aprovação. */
  shareToken: string;
  pendingCount: number;
  /** Quantos pendentes de cada categoria — usado pelo filtro por categoria na home do professor. */
  pendingByCategory: Record<CategoryKey, number>;
};

type PendingCertificateRow = {
  aluno_id: string;
  categoria_id: string;
  profiles: { nome: string | null; email: string; share_token: string } | null;
};

function emptyCategoryCounts(): Record<CategoryKey, number> {
  return { complementares: 0, extensao: 0 };
}

/**
 * Lista, agrupados por aluno, todos os certificados com status "pendente" —
 * usado pela home do professor ("Gerenciar certificados"). O RLS da tabela
 * "certificates" já garante que só um professor autenticado recebe todas as
 * linhas de volta (um aluno só veria as próprias); "Todos podem ver perfis"
 * libera o join com "profiles" pra pegar nome/e-mail/token de cada um.
 */
export async function listStudentsWithPendingCertificates(
  supabase: SupabaseClient,
): Promise<PendingReviewGroup[]> {
  const [{ data, error }, categoryIds] = await Promise.all([
    supabase
      .from("certificates")
      .select("aluno_id, categoria_id, profiles!certificates_aluno_id_fkey(nome, email, share_token)")
      .eq("status", "pendente"),
    getCategoryIds(supabase),
  ]);

  if (error) throw error;

  const categoryKeyById = new Map<string, CategoryKey>(
    (Object.entries(categoryIds) as [CategoryKey, string][]).map(([key, id]) => [id, key]),
  );

  const groups = new Map<string, PendingReviewGroup>();
  for (const row of (data ?? []) as unknown as PendingCertificateRow[]) {
    if (!row.profiles) continue;

    const categoryKey = categoryKeyById.get(row.categoria_id) ?? "complementares";

    const existing = groups.get(row.aluno_id);
    if (existing) {
      existing.pendingCount += 1;
      existing.pendingByCategory[categoryKey] += 1;
      continue;
    }

    const pendingByCategory = emptyCategoryCounts();
    pendingByCategory[categoryKey] = 1;

    groups.set(row.aluno_id, {
      studentId: row.aluno_id,
      name: row.profiles.nome,
      email: row.profiles.email,
      shareToken: row.profiles.share_token,
      pendingCount: 1,
      pendingByCategory,
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    (a.name ?? a.email).localeCompare(b.name ?? b.email),
  );
}

export type NewCertificateInput = {
  studentId: string;
  title: string;
  category: CategoryKey;
  hours: number;
  activityDate: string;
  file: File;
};

/** Envia o arquivo para o Storage e cria a linha em "certificates" + o log inicial. */
export async function createCertificate(
  supabase: SupabaseClient,
  input: NewCertificateInput,
): Promise<Certificate> {
  const categoryIds = await getCategoryIds(supabase);
  const categoriaId = categoryIds[input.category];
  if (!categoriaId) {
    throw new Error(`Categoria desconhecida: ${input.category}`);
  }

  const fileType: CertificateFileType = input.file.type === "application/pdf" ? "pdf" : "imagem";
  const extensionMatch = input.file.name.match(/\.[a-zA-Z0-9]+$/);
  const extension = extensionMatch?.[0] ?? (fileType === "pdf" ? ".pdf" : ".jpg");
  const objectPath = `${input.studentId}/${crypto.randomUUID()}${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, input.file, { contentType: input.file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      aluno_id: input.studentId,
      categoria_id: categoriaId,
      titulo: input.title,
      carga_horaria: input.hours,
      data_atividade: input.activityDate,
      arquivo_url: objectPath,
      arquivo_nome: input.file.name,
      tipo_arquivo: fileType,
      status: "pendente",
    })
    .select()
    .single();

  if (error || !data) {
    // Evita deixar arquivo órfão no Storage se o insert falhar.
    await supabase.storage.from(BUCKET).remove([objectPath]);
    throw error ?? new Error("Falha ao salvar o certificado.");
  }

  // Log da criação — mantém o histórico completo de status (mesmo o inicial).
  await supabase.from("certificate_logs").insert({
    certificado_id: data.id,
    alterado_por: input.studentId,
    status_anterior: null,
    status_novo: "pendente",
  });

  return mapRow(data as CertificateRow, input.category);
}

/** Remove a linha do banco e o arquivo correspondente no Storage. */
export async function removeCertificate(
  supabase: SupabaseClient,
  certificate: Certificate,
): Promise<void> {
  const { error } = await supabase.from("certificates").delete().eq("id", certificate.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([certificate.filePath]);
}

/** Aprova/rejeita via função no banco (`alterar_status_certificado`), que também grava o log. */
export async function setCertificateStatus(
  supabase: SupabaseClient,
  certificateId: string,
  status: Extract<CertificateStatus, "aprovado" | "rejeitado">,
  reason?: string,
): Promise<void> {
  const { error } = await supabase.rpc("alterar_status_certificado", {
    p_certificado_id: certificateId,
    p_novo_status: status,
    p_motivo: reason ?? null,
  });
  if (error) throw error;
}

/** Último motivo de rejeição registrado em "certificate_logs" para o certificado. */
export async function getLatestRejectionReason(
  supabase: SupabaseClient,
  certificateId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("certificate_logs")
    .select("motivo_rejeicao")
    .eq("certificado_id", certificateId)
    .eq("status_novo", "rejeitado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data?.motivo_rejeicao ?? null;
}

/** Gera uma signed URL temporária (1h) pro arquivo — o bucket é privado. */
export async function getCertificateFileUrl(
  supabase: SupabaseClient,
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}

/** Token de compartilhamento salvo no perfil do aluno (profiles.share_token). */
export async function getShareTokenForStudent(
  supabase: SupabaseClient,
  studentId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("share_token")
    .eq("id", studentId)
    .single();

  if (error) return null;
  return (data?.share_token as string | undefined) ?? null;
}

/** Resolve um token do link compartilhável para o aluno dono dos certificados. */
export async function getStudentByShareToken(
  supabase: SupabaseClient,
  token: string,
): Promise<{ id: string; email: string } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("share_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id as string, email: data.email as string };
}

/** Dados exibidos na página pública de comprovante verificável. */
export type CertificateVerification = {
  title: string;
  hours: number;
  category: string;
  studentName: string;
  professorName: string;
  approvedAt: string;
};

type VerificationRow = {
  titulo: string;
  carga_horaria: number;
  categoria: string;
  aluno_nome: string;
  professor_nome: string;
  aprovado_em: string;
};

/**
 * Consulta pública e sem login o código de um comprovante verificável, via a
 * função `verificar_certificado` (SECURITY DEFINER, liberada pro papel
 * "anon" — ver migration `add_certificate_verification_code`). Funciona com
 * qualquer client Supabase, autenticado ou não: quem abre o QR code de um
 * comprovante nunca tem sessão no CertiBox.
 */
export async function verifyCertificateCode(
  supabase: SupabaseClient,
  code: string,
): Promise<CertificateVerification | null> {
  const { data, error } = await supabase.rpc("verificar_certificado", { p_codigo: code });
  if (error) return null;

  const row = (data as VerificationRow[] | null)?.[0];
  if (!row) return null;

  return {
    title: row.titulo,
    hours: row.carga_horaria,
    category: row.categoria,
    studentName: row.aluno_nome,
    professorName: row.professor_nome,
    approvedAt: row.aprovado_em,
  };
}
