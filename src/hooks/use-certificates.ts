"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  createCertificate,
  listCertificatesByStudent,
  removeCertificate as removeCertificateApi,
  setCertificateStatus,
  type NewCertificateInput,
} from "@/lib/supabase/certificates";
import type { Certificate, CertificateStatus } from "@/lib/hours/types";

export type UploadCertificateInput = Omit<NewCertificateInput, "studentId">;

/**
 * Certificados do aluno logado — agora persistidos no Supabase (tabela
 * "certificates" + Storage bucket "certificados") em vez de localStorage,
 * então funcionam entre navegadores e dispositivos diferentes.
 */
export function useCertificates() {
  const supabase = createClient();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCertificates([]);
      setLoaded(true);
      return;
    }
    try {
      const rows = await listCertificatesByStudent(supabase, user.id);
      setCertificates(rows);
    } catch (error) {
      console.error("CertiBox: falha ao carregar certificados.", error);
    } finally {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    setLoaded(false);
    refresh();
  }, [refresh]);

  const addCertificate = useCallback(
    async (input: UploadCertificateInput) => {
      if (!user) throw new Error("Você precisa estar logado.");
      await createCertificate(supabase, { ...input, studentId: user.id });
      await refresh();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, refresh],
  );

  /** Usado pela tela de aprovação (professor): aprova ou rejeita um certificado. */
  const updateCertificateStatus = useCallback(
    async (id: string, status: CertificateStatus, reason?: string) => {
      if (status === "pendente") return;
      await setCertificateStatus(supabase, id, status, reason);
      await refresh();
    },
    [refresh],
  );

  /** Remove um certificado (banco + arquivo no Storage) — ação irreversível. */
  const removeCertificate = useCallback(
    async (certificate: Certificate) => {
      await removeCertificateApi(supabase, certificate);
      await refresh();
    },
    [refresh],
  );

  return {
    certificates,
    loaded,
    addCertificate,
    updateCertificateStatus,
    removeCertificate,
  };
}
