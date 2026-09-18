import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// "/verificar" é o comprovante verificável (QR code de um certificado
// aprovado) — precisa ser público de propósito: quem abre o link é um
// terceiro (ex.: recrutador de estágio) que nunca teve conta no CertiBox.
const PUBLIC_ROUTES = ["/login", "/auth/callback", "/verificar", "/_next", "/favicon.ico"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Login Google (OAuth) e login SIGA (simulado) são, hoje, os dois sessões
 * reais do Supabase Auth (OAuth e anônima, respectivamente), então
 * `updateSession` já cobre os dois — não existe mais um cookie de mock
 * separado por fora do Supabase.
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const isAuthenticated = Boolean(user);
  const pathname = request.nextUrl.pathname;

  // Se não estiver logado e tentar acessar rota protegida (o link
  // compartilhável agora é uma delas: precisa estar logado, seja como
  // aluno olhando os próprios certificados ou como professor aprovando)
  // -> login.
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se estiver logado e tentar acessar /login -> dashboard
  if (isAuthenticated && pathname === "/login") {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // "/api" fica de fora: middleware (Edge) na frente de uma rota que lê o
    // corpo da requisição (ex.: /api/send-report, que recebe multipart/
    // form-data com o PDF) pode corromper esse corpo antes de chegar no
    // Route Handler — é um problema conhecido do Next.js. Rotas de API
    // cuidam da própria autenticação (ver checagem de usuário dentro delas).
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
