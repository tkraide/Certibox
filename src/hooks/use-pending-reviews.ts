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

  return { groups, loaded, refresh };
}
