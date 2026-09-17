"use client";

import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  /** URL da foto (Google) — ausente no login SIGA simulado. */
  src?: string;
  /** Tamanho do círculo, ex.: "h-9 w-9". */
  sizeClassName: string;
  /** Tamanho do ícone de fallback, ex.: "h-6 w-6". */
  iconSizeClassName: string;
};

/**
 * Foto de perfil com fallback automático pro ícone genérico — tanto quando
 * não há avatar (login SIGA simulado, que não tem foto) quanto quando a
 * imagem do Google falha ao CARREGAR no navegador (instabilidade de rede,
 * bloqueador de rastreamento etc.). A URL em si já vem certa desde o
 * primeiro login (o Supabase grava o avatar_url do Google na troca do
 * código OAuth); o que faltava era tratar o load da imagem falhando -
 * sem isso, uma falha passageira deixava a foto "quebrada" em vez de cair
 * no ícone, mesmo a URL estando correta.
 */
export function UserAvatar({ src, sizeClassName, iconSizeClassName }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  // Se a URL mudar (trocou de conta, por exemplo), dá uma nova chance a ela.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-800",
          sizeClassName,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-400",
        sizeClassName,
      )}
    >
      <UserCircle className={iconSizeClassName} aria-hidden="true" />
    </div>
  );
}
