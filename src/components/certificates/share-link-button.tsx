"use client";

import { useState } from "react";
import { Check, Link2, Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { getShareTokenForStudent } from "@/lib/supabase/certificates";
import { cn } from "@/lib/utils";

/**
 * Gera o link compartilhável a partir do "share_token" salvo no perfil do
 * aluno (Supabase) e copia para a área de transferência. Como os
 * certificados agora vivem num banco real (não mais localStorage), o link
 * funciona em qualquer navegador ou dispositivo — não só no que fez upload.
 */
export function ShareLinkButton() {
  const supabase = createClient();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getShareTokenForStudent(supabase, user.id);
      if (!token) return;
      const url = `${window.location.origin}/certificados/compartilhado/${token}`;

      try {
        await navigator.clipboard.writeText(url);
      } catch {
        window.prompt("Copie o link compartilhável:", url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100",
        "dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
        loading && "cursor-not-allowed opacity-60",
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Gerando link...
        </>
      ) : copied ? (
        <>
          <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          Link copiado!
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Gerar link compartilhável
        </>
      )}
    </button>
  );
}
