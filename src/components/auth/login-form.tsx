"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome, GraduationCap, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { resolveRoleFromEmail } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSiga, setLoadingSiga] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoadingGoogle(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Erro ao iniciar login com Google. Tente novamente.");
      setLoadingGoogle(false);
    }
  }

  async function handleSigaMockLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSiga(true);
    setError(null);

    const trimmed = email.trim().toLowerCase();

    if (!trimmed.endsWith("@estudante.ufscar.br") && !trimmed.endsWith("@ufscar.br")) {
      setError("Use um e-mail institucional da UFSCar (@estudante.ufscar.br ou @ufscar.br).");
      setLoadingSiga(false);
      return;
    }

    const role = resolveRoleFromEmail(trimmed);

    // Mock: cria uma sessão via signInWithPassword com um usuário fake
    // Em prototipagem, salvamos o perfil no localStorage para simular autenticação
    // e redirecionamos. Em produção, substituir por integração real com SIGA.
    const mockUser = {
      id: `siga-mock-${Date.now()}`,
      email: trimmed,
      role,
      provider: "siga_mock",
      created_at: new Date().toISOString(),
    };

    localStorage.setItem("certibox_mock_session", JSON.stringify(mockUser));

    // Dispara evento para que o middleware/client saiba que o usuário está logado
    window.dispatchEvent(new Event("storage"));

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-xl font-bold text-neutral-950"
        >
          C
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">CertiBox</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Gestão de horas complementares — UFSCar
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loadingGoogle}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors",
          "hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-600",
          "dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
          loadingGoogle && "opacity-60 cursor-not-allowed"
        )}
      >
        {loadingGoogle ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Chrome className="h-4 w-4" aria-hidden="true" />
        )}
        Entrar com Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-neutral-50 px-2 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
            ou use o SIGA (simulado)
          </span>
        </div>
      </div>

      <form onSubmit={handleSigaMockLogin} className="space-y-3">
        <label htmlFor="siga-email" className="sr-only">
          E-mail institucional
        </label>
        <input
          id="siga-email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu-email@estudante.ufscar.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          )}
        />
        <button
          type="submit"
          disabled={loadingSiga}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors",
            "hover:bg-primary-400 focus-visible:ring-2 focus-visible:ring-primary-600",
            loadingSiga && "opacity-60 cursor-not-allowed"
          )}
        >
          {loadingSiga ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
          )}
          Entrar com SIGA
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
        Hackathon SeCoT XVIII · UFSCar
      </p>
    </div>
  );
}
