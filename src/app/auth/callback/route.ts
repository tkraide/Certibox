import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    // Loga o motivo real da falha (visível nos "Logs"/"Runtime Logs" do
    // projeto na Vercel) — sem isso, o usuário só via a tela de login de
    // novo, sem nenhuma pista do que deu errado (ex.: code_verifier ausente,
    // comum em navegadores mobile que descartam esse cookie entre a ida
    // pro Google e a volta pro site).
    console.error("[auth/callback] exchangeCodeForSession falhou:", error.message);
  } else {
    console.error("[auth/callback] callback sem parâmetro 'code' na URL.");
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
