"use client";

import { usePathname } from "next/navigation";

import { AccessibilityToolbar } from "@/components/accessibility/accessibility-toolbar";
import { VLibrasWidget } from "@/components/accessibility/vlibras-widget";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Sidebar } from "@/components/navigation/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

import { Header } from "./header";

// Rotas sem usuário logado (login) não usam a moldura do app — Sidebar,
// Header e BottomNav não fazem sentido ali (não há menu nem sessão) e, pior,
// empilhavam altura (header + padding do <main> + min-h-dvh da própria tela
// de login) fazendo a página precisar de scroll para centralizar o
// formulário. Nessas rotas a página é renderizada sozinha, ocupando a tela
// inteira, e o widget do VLibras continua disponível (acessibilidade vale
// também para quem ainda não entrou).
const CHROMELESS_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChromeless = CHROMELESS_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`),
  );

  if (isChromeless) {
    return (
      <div className="min-h-dvh bg-neutral-50 dark:bg-neutral-950">
        {/*
          Sem Header aqui (ver comentário acima), mas quem ainda não entrou
          também precisa ajustar tema e preferências de acessibilidade — os
          dois controles flutuam no canto, sem reservar altura no layout
          centralizado da tela de login.
        */}
        <div className="fixed right-4 top-4 z-40 flex items-center gap-3">
          <AccessibilityToolbar />
          <ThemeToggle />
        </div>

        <VLibrasWidget />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50 dark:bg-neutral-950">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-neutral-950"
      >
        Pular para o conteúdo
      </a>

      <VLibrasWidget />

      <Sidebar />

      <div className="flex min-h-dvh flex-col md:pl-sidebar">
        <Header />
        <main
          id="conteudo"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-[calc(theme(spacing.bottom-nav)+1.5rem)] md:px-8 md:py-8 md:pb-8"
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
