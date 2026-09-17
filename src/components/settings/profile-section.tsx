"use client";

import { Loader2 } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { UserAvatar } from "@/components/auth/user-avatar";
import { useAuth } from "@/hooks/use-auth";

const ROLE_LABEL: Record<"aluno" | "professor", string> = {
  aluno: "Aluno",
  professor: "Professor",
};

const PROVIDER_LABEL: Record<"google" | "siga_mock", string> = {
  google: "Login com Google",
  siga_mock: "Login SIGA (simulado)",
};

/** Ícone/avatar do usuário, identificação e opção de sair — pedido explícito da tela de Configurações. */
export function ProfileSection() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section aria-label="Perfil" className="card flex items-center justify-center gap-2 py-10">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" aria-hidden="true" />
        <span className="text-sm text-neutral-500 dark:text-neutral-500">Carregando perfil...</span>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section aria-labelledby="perfil-heading" className="card">
      <h2 id="perfil-heading" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Perfil
      </h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar src={user.avatar} sizeClassName="h-14 w-14" iconSizeClassName="h-8 w-8" />

          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-sm text-neutral-500 dark:text-neutral-500">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {ROLE_LABEL[user.role]}
              </span>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {PROVIDER_LABEL[user.provider]}
              </span>
            </div>
          </div>
        </div>

        <LogoutButton className="shrink-0 border border-neutral-200 dark:border-neutral-800" />
      </div>
    </section>
  );
}
