import { BottomNav } from "@/components/navigation/bottom-nav";
import { Sidebar } from "@/components/navigation/sidebar";

import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50 dark:bg-neutral-950">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-neutral-950"
      >
        Pular para o conteúdo
      </a>

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
