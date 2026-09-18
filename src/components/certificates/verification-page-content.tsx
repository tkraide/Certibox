"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { verifyCertificateCode, type CertificateVerification } from "@/lib/supabase/certificates";

type VerificationState = "loading" | "found" | "not-found";

/**
 * Conteúdo da página pública `/verificar/[codigo]`. É "use client" (e não um
 * Server Component com fetch direto) pelo mesmo motivo de
 * `SharedCertificatesContent`: todo o resto do app já busca dados assim, com
 * o client do browser (`@/lib/supabase/client`) — que aqui funciona sem
 * sessão nenhuma, porque `verificar_certificado` é a função SECURITY
 * DEFINER liberada pro papel "anon" (ver a migration
 * `add_certificate_verification_code`).
 */
export function VerificationPageContent({ code }: { code: string }) {
  const supabase = createClient();
  const [state, setState] = useState<VerificationState>("loading");
  const [result, setResult] = useState<CertificateVerification | null>(null);

  useEffect(() => {
    let active = true;
    setState("loading");
    verifyCertificateCode(supabase, code).then((data) => {
      if (!active) return;
      setResult(data);
      setState(data ? "found" : "not-found");
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 py-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="CertiBox" className="h-12 w-12" />

      {state === "loading" && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Verificando certificado...
        </div>
      )}

      {state === "not-found" && (
        <div className="card w-full space-y-3 border-red-200 bg-red-50 text-center text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <ShieldAlert className="mx-auto h-8 w-8" aria-hidden="true" />
          <h1 className="text-base font-semibold">Código não encontrado</h1>
          <p className="text-sm">
            Este código não corresponde a nenhum certificado aprovado no CertiBox. Confira se o
            link ou o QR code foi copiado corretamente.
          </p>
        </div>
      )}

      {state === "found" && result && (
        <div className="card w-full space-y-4">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-400">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            <span className="text-sm font-semibold">Certificado verificado</span>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-neutral-500 dark:text-neutral-500">Certificado</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">{result.title}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-500">Aluno</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {result.studentName}
              </dd>
            </div>
            <div className="flex gap-6">
              <div>
                <dt className="text-neutral-500 dark:text-neutral-500">Categoria</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                  {result.category}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 dark:text-neutral-500">Carga horária</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                  {result.hours}h
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-500">Aprovado por</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {result.professorName}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-500">Data da aprovação</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {new Date(result.approvedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>

          <p className="border-t border-neutral-200 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
            Este comprovante confirma que o certificado acima foi revisado e aprovado por um
            professor no CertiBox — sistema de gestão de horas complementares e de extensão da
            UFSCar.
          </p>
        </div>
      )}
    </div>
  );
}
