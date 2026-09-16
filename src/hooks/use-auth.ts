"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { resolveRoleFromEmail } from "@/lib/auth/roles";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: "aluno" | "professor";
  provider: "google" | "siga_mock";
};

function getMockUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("certibox_mock_session");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id,
      email: parsed.email,
      role: parsed.role,
      provider: "siga_mock",
    };
  } catch {
    return null;
  }
}

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      // 1. Tenta sessão real do Supabase (Google)
      const { data } = await supabase.auth.getSession();
      const sbUser = data.session?.user ?? null;

      if (sbUser) {
        if (isMounted) {
          setUser({
            id: sbUser.id,
            email: sbUser.email ?? "",
            name: sbUser.user_metadata?.full_name ?? sbUser.user_metadata?.name,
            avatar: sbUser.user_metadata?.avatar_url,
            role: resolveRoleFromEmail(sbUser.email ?? ""),
            provider: "google",
          });
        }
      } else {
        // 2. Fallback para mock do SIGA
        const mock = getMockUser();
        if (isMounted) setUser(mock);
      }

      if (isMounted) setLoading(false);
    }

    loadUser();

    // Listener para mudanças de auth (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
            avatar: session.user.user_metadata?.avatar_url,
            role: resolveRoleFromEmail(session.user.email ?? ""),
            provider: "google",
          });
        } else if (event === "SIGNED_OUT") {
          // Verifica se ainda existe mock
          const mock = getMockUser();
          setUser(mock);
        }
      }
    );

    // Listener para storage (mock SIGA em outra aba)
    function onStorage() {
      loadUser();
    }
    window.addEventListener("storage", onStorage);

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [supabase]);

  return { user, loading };
}
