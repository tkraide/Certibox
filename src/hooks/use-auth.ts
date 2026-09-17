"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { resolveRoleFromEmail, type UserRole } from "@/lib/auth/roles";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  provider: "google" | "siga_mock";
};

/**
 * Sessão do usuário — hoje sempre uma sessão real do Supabase Auth: OAuth
 * do Google, ou uma sessão ANÔNIMA (login "SIGA simulado", que carrega
 * e-mail/papel simulados em `user_metadata` em vez de um e-mail real).
 *
 * Como sessões anônimas não têm e-mail nativo no auth.users, o papel/e-mail
 * "de verdade" do usuário vivem na tabela "profiles" (id -> auth.users.id).
 * Por isso, a cada mudança de sessão, garantimos que existe uma linha de
 * perfil correspondente antes de expor o usuário pro resto do app.
 */
export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFromSupabaseUser(sbUser: User | null) {
      if (!sbUser) {
        if (isMounted) setUser(null);
        return;
      }

      const isAnonymous = Boolean(sbUser.is_anonymous);
      const metadataEmail = sbUser.user_metadata?.email as string | undefined;
      const email = (metadataEmail ?? sbUser.email ?? "").toLowerCase();
      const metadataRole = sbUser.user_metadata?.role as UserRole | undefined;
      const role = metadataRole ?? resolveRoleFromEmail(email);
      const fullName = sbUser.user_metadata?.full_name as string | undefined;

      // Sessões anônimas (login SIGA simulado) recebem um auth.uid() NOVO a
      // cada login — não dá pra "retomar" a identidade anônima anterior.
      // Por isso, em vez de um upsert por id (que criaria um segundo
      // perfil e colidiria com o e-mail UNIQUE já existente), buscamos
      // primeiro um perfil já existente com esse e-mail: se achar, usamos
      // o id ESTÁVEL dele — o mesmo que as políticas de RLS resolvem via
      // current_profile_id() — e só criamos um perfil novo (com o id da
      // sessão atual) se realmente não existir nenhum ainda.
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select()
        .eq("email", email)
        .maybeSingle();

      let profile = existingProfile;

      if (!profile) {
        const { data: createdProfile } = await supabase
          .from("profiles")
          .insert({ id: sbUser.id, email, role, nome: fullName ?? null })
          .select()
          .single();
        profile = createdProfile;
      } else if (fullName && profile.nome !== fullName) {
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .update({ nome: fullName })
          .eq("id", profile.id)
          .select()
          .single();
        if (updatedProfile) profile = updatedProfile;
      }

      if (!isMounted) return;

      setUser({
        id: (profile?.id as string | undefined) ?? sbUser.id,
        email: (profile?.email as string | undefined) ?? email,
        name: fullName,
        avatar: sbUser.user_metadata?.avatar_url as string | undefined,
        role: (profile?.role as UserRole | undefined) ?? role,
        provider: isAnonymous ? "siga_mock" : "google",
      });
    }

    async function init() {
      const { data } = await supabase.auth.getSession();
      await loadFromSupabaseUser(data.session?.user ?? null);
      if (isMounted) setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await loadFromSupabaseUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}
