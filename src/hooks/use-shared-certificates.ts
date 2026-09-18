"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { listCertificatesByStudent, setCertificateStatus } from "@/lib/supabase/certificates";
import type { Certificate, CertificateStatus } from "@/lib/hours/types";

/**
 * Certificados de UM aluno específico, identificado pelo id resolvido a
 * partir do token do link compartilhável — usado pela página pública de
 * aprovação. O RLS do banco garante, independentemente do que a página
 * pedir, que só o próprio aluno ou um professor autenticado recebem
 * alguma linha de volta.
 */
export function useSharedCertificates(studentId: string | null) {
  const supabase = createClient();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!studentId) {
      setCertificates([]);
      setLoaded(true);
      return;
    }
    try {
      const rows = await listCertificatesByStudent(supabase, studentId);
      setCertificates(rows);
    } catch (error) {
      console.error("CertiBox: falha ao carregar certificados compartilhados.", error);
      setCertificates([]);
    } finally {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useEffect(() => {
    setLoaded(false);
    refresh();
  }, [refresh]);

  // Tempo real: se o aluno enviar um novo certificado enquanto o professor
  // está com essa página aberta (ou o próprio aluno em outra aba), a lista
  // atualiza sozinha.
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`shared-certificates-${studentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "certificates", filter: `aluno_id=eq.${studentId}` },
        () => {
          refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, refresh]);

  const updateCertificateStatus = useCallback(
    async (id: string, status: CertificateStatus, reason?: string) => {
      if (status === "pendente") return;
      await setCertificateStatus(supabase, id, status, reason);
      await refresh();
    },
    [refresh],
  );

  return { certificates, loaded, updateCertificateStatus };
}
