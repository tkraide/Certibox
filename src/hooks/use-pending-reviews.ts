"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  listStudentsWithPendingCertificates,
  type PendingReviewGroup,
} from "@/lib/supabase/certificates";

/**
 * Alunos com certificados pendentes de aprovação — usado pela home do
 * professor ("Gerenciar certificados").
 */
export function usePendingReviews() {
  const supabase = createClient();
  const [groups, setGroups] = useState<PendingReviewGroup[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await listStudentsWithPendingCertificates(supabase);
      setGroups(rows);
    } catch (error) {
      console.error("CertiBox: falha ao carregar certificados pendentes.", error);
      setGroups([]);
    } finally {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Tempo real: assim que um aluno envia um certificado novo (ou outro
  // professor decide um pendente), a lista de "Gerenciar certificados"
  // atualiza sozinha. Sem filtro por status de propósito — uma linha que
  // SAI de "pendente" (aprovada/rejeitada) também precisa disparar um
  // refresh pra sumir da lista, e o filtro do Realtime só teria acesso ao
  // valor NOVO da linha, não o antigo. O RLS já garante que só um professor
  // autenticado recebe esses eventos.
  useEffect(() => {
    const channel = supabase
      .channel("pending-reviews")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "certificates" },
        () => {
          refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return { groups, loaded, refresh };
}
