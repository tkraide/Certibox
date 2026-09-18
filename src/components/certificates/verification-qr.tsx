"use client";

import { useEffect, useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import QRCode from "qrcode";

import { cn } from "@/lib/utils";

/**
 * QR code + link do comprovante verificável de um certificado já aprovado
 * (ver `verificationCode` em `@/lib/hours/types` e a página pública
 * `/verificar/[codigo]`). Gerado no client porque precisa de
 * `window.location.origin` — o mesmo motivo do link em `ShareLinkButton`.
 */
export function VerificationQr({ code }: { code: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const link = `${window.location.origin}/verificar/${code}`;
    setUrl(link);
    setDataUrl(null);

    let active = true;
    QRCode.toDataURL(link, { width: 176, margin: 1 })
      .then((generated) => {
        if (active) setDataUrl(generated);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [code]);

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copie o link do comprovante:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        <QrCode className="h-4 w-4" aria-hidden="true" />
        Comprovante verificável
      </div>
      <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-500">
        Qualquer pessoa pode escanear o QR code ou abrir o link para confirmar que este
        certificado foi aprovado — sem precisar de login. Útil para anexar em pedidos de estágio
        ou no currículo.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="QR code para a página pública de verificação deste certificado"
            className="h-24 w-24 rounded border border-neutral-200 dark:border-neutral-800"
          />
        ) : (
          <div
            className="h-24 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!url}
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100",
            "dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              Link copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar link do comprovante
            </>
          )}
        </button>
      </div>
    </div>
  );
}
