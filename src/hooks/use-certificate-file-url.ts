"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { getCertificateFileUrl } from "@/lib/supabase/certificates";

/**
 * Resolve o caminho de um certificado no Storage (bucket privado) para uma
 * signed URL temporária, usável direto em <img>/<iframe src>.
 */
export function useCertificateFileUrl(path: string | null) {
  const supabase = createClient();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    if (!path) return;

    getCertificateFileUrl(supabase, path).then((signedUrl) => {
      if (!cancelled) setUrl(signedUrl);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return url;
}
