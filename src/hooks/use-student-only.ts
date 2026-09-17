"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

/**
 * Restringe uma página ao perfil de aluno: se um professor logado tentar
 * acessar (por link direto, digitando a URL etc.), redireciona pra home dele
 * ("Gerenciar certificados"). É só uma camada de UX/roteamento — a
 * segurança de verdade continua sendo o RLS do banco, que já limita o que
 * cada papel consegue ler/escrever independentemente do que a tela pede.
 *
 * Retorna `blocked: true` enquanto o redirecionamento está em andamento,
 * pra a página evitar renderizar o conteúdo (mesmo que por um instante)
 * pra quem não deveria vê-lo.
 */
export function useStudentOnly() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const blocked = !loading && user?.role === "professor";

  useEffect(() => {
    if (blocked) router.replace("/");
  }, [blocked, router]);

  return { blocked };
}
