"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chrome, Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { resolveRoleFromEmail } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSiga, setLoadingSiga] = useState(false);
  // Se o callback do OAuth (`/auth/callback`) falhou e redirecionou de volta
  // pra cá com "?error=auth", mostra o aviso já na primeira renderização —
  // sem isso, a tela simplesmente "voltava pro login" sem nenhuma pista de
  // que algo deu errado (foi assim que o problema no Google login pelo
  // celular passou despercebido).
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "Não foi possível concluir o login com Google. Tente novamente ou use o SIGA (simulado) abaixo."
      : null,
  );

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

    if (!password) {
      setError("Informe a senha do SIGA.");
      setLoadingSiga(false);
      return;
    }

    const role = resolveRoleFromEmail(trimmed);

    // Mock: como não existe integração real com o SIGA neste protótipo, a
    // senha não é validada contra nada — ela só existe para reproduzir o
    // formulário real do SIGA (e-mail + senha). Para que os certificados
    // fiquem salvos num banco de verdade (com RLS por usuário), esse login
    // simulado abre uma sessão ANÔNIMA de verdade do Supabase Auth — não
    // mais um cookie próprio por fora do Supabase — carregando e-mail/papel
    // simulados em metadata.
    //
    // Isso exige que "Anonymous Sign-Ins" esteja habilitado no projeto
    // Supabase (Authentication → Sign In / Providers → Anonymous
    // Sign-Ins), já que essa opção vem desligada por padrão.
    //
    // A criação/atualização do registro em "profiles" NÃO é feita aqui:
    // cada login anônimo recebe um auth.uid() novo, então um upsert por id
    // aqui colidiria com o e-mail (já existente de um login anterior). Quem
    // resolve isso é o hook useAuth, reagindo ao evento de mudança de
    // sessão logo abaixo: ele busca o perfil pelo e-mail e reaproveita o id
    // estável já existente, se houver.
    const { data, error: signInError } = await supabase.auth.signInAnonymously({
      options: { data: { email: trimmed, role } },
    });

    if (signInError || !data.user) {
      setError(
        signInError?.message.toLowerCase().includes("anonymous")
          ? "Login SIGA (simulado) indisponível: habilite \"Anonymous Sign-Ins\" nas configurações de Authentication do Supabase."
          : "Não foi possível entrar com o SIGA (simulado). Tente novamente.",
      );
      setLoadingSiga(false);
      return;
    }

    setPassword("");
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
          Gestão de horas complementares e de extensão
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
      <p className="-mt-3 text-center text-xs text-neutral-500 dark:text-neutral-500">
        Disponível apenas para e-mail institucional da UFSCar
      </p>

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

        <label htmlFor="siga-password" className="sr-only">
          Senha
        </label>
        <div className="relative">
          <input
            id="siga-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400",
              "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
              "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition-colors hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

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
