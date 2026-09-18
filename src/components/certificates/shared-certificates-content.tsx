"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Loader2, ShieldAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useSharedCertificates } from "@/hooks/use-shared-certificates";
import { createClient } from "@/lib/supabase/client";
import { getStudentByShareToken } from "@/lib/supabase/certificates";
import type { Certificate } from "@/lib/hours/types";

import { CertificateList } from "./certificate-list";
import { CertificateReviewActions } from "./certificate-review-actions";
import { CertificateViewerDialog } from "./certificate-viewer-dialog";
import { RejectCertificateDialog } from "./reject-certificate-dialog";

/**
 * Página exposta pelo botão "Gerar link compartilhável".
 *
 * O token na URL é resolvido (via `getStudentByShareToken`) para o aluno
 * dono dos certificados; o middleware (`src/middleware.ts`) já exige estar
 * logado para chegar até aqui. A partir daí:
 * - Professor logado (e-mail @ufscar.br) vê a lista com os botões de
 *   Aprovar/Rejeitar.
 * - O próprio aluno (dono do link) vê a lista em modo somente leitura.
 * - Qualquer outro usuário logado vê "acesso restrito" — e mesmo que essa
 *   checagem falhasse, o RLS do banco (tabela "certificates") já impede
 *   que a consulta retorne alguma linha pra quem não é dono nem professor.
 */
export function SharedCertificatesContent({ token }: { token: string }) {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const [resolving, setResolving] = useState(true);
  const [student, setStudent] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStudentByShareToken(supabase, token).then((result) => {
      if (cancelled) return;
      setStudent(result);
      setResolving(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const { certificates, loaded, updateCertificateStatus } = useSharedCertificates(
    student?.id ?? null,
  );
  const [viewing, setViewing] = useState<Certificate | null>(null);
  const [rejecting, setRejecting] = useState<Certificate | null>(null);

  // Best-effort: avisa o aluno por e-mail que o status mudou. Nunca deve
  // travar a aprovação/rejeição em si (que já foi salva antes desta
  // chamada) — por isso o erro só vai pro console.
  function notifyStatusChange(
    certificate: Certificate,
    status: "aprovado" | "rejeitado",
    reason?: string,
  ) {
    if (!student) return;
    fetch("/api/notify-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentEmail: student.email,
        certificateTitle: certificate.title,
        status,
        reason,
      }),
    }).catch((err) => {
      console.error("CertiBox: falha ao notificar aluno por e-mail.", err);
    });
  }

  const isProfessor = user?.role === "professor";
  const isOwner = Boolean(user && student && user.id === student.id);

  if (authLoading || resolving) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-4 py-10 text-sm text-neutral-500 dark:text-neutral-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando sessão...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="mx-auto min-h-dvh max-w-3xl px-4 py-10">
        <div className="flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Link inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  if (!isProfessor && !isOwner) {
    return (
      <div className="mx-auto min-h-dvh max-w-3xl px-4 py-10">
        <div className="flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Acesso restrito ao próprio aluno ou a professores logados com e-mail institucional
            (@ufscar.br).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Certificados compartilhados</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {isProfessor
            ? "Você está logado como professor — aprove ou rejeite os certificados pendentes."
            : "Visualização somente leitura dos seus certificados enviados para aprovação."}
        </p>
      </header>

      {isProfessor ? (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-3 text-xs text-primary-900 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200">
          <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Sessão de professor identificada por <strong>{user?.email}</strong> (e-mail
            @ufscar.br). Revisando os certificados de <strong>{student.email}</strong>. As
            decisões abaixo ficam registradas no histórico de cada certificado.
          </p>
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Esta é a visualização somente leitura dos seus próprios certificados.</p>
        </div>
      )}

      {loaded && (
        <CertificateList
          certificates={certificates}
          onSelect={setViewing}
          actionsPlacement="stacked"
          renderActions={
            isProfessor
              ? (certificate) => (
                  <CertificateReviewActions
                    certificate={certificate}
                    onApprove={() => {
                      updateCertificateStatus(certificate.id, "aprovado");
                      notifyStatusChange(certificate, "aprovado");
                    }}
                    onReject={() => setRejecting(certificate)}
                  />
                )
              : undefined
          }
        />
      )}

      <CertificateViewerDialog certificate={viewing} onClose={() => setViewing(null)} />
      <RejectCertificateDialog
        certificate={rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => {
          if (rejecting) {
            updateCertificateStatus(rejecting.id, "rejeitado", reason);
            notifyStatusChange(rejecting, "rejeitado", reason);
          }
          setRejecting(null);
        }}
      />
    </div>
  );
}
