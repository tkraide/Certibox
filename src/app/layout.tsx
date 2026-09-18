import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CertiBox",
    template: "%s · CertiBox",
  },
  description:
    "Gestão pessoal de horas complementares e de extensão — Hackathon SeCoT XVIII.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-dvh font-sans">
        {/*
          Aplica as preferências salvas da Toolbar de acessibilidade (fonte,
          alto contraste, redução de movimento) ANTES da hidratação — mesma
          ideia do script anti-flash que o next-themes usa para o tema
          claro/escuro, evitando que a página pisque no padrão antes de
          aplicar o que o usuário escolheu (ver use-accessibility-prefs.ts).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var scale = localStorage.getItem("certibox:font-scale");
                  if (scale) document.documentElement.style.setProperty("--font-scale", scale);
                  if (localStorage.getItem("certibox:high-contrast") === "1") {
                    document.documentElement.setAttribute("data-contrast", "high");
                  }
                  if (localStorage.getItem("certibox:reduce-motion") === "1") {
                    document.documentElement.classList.add("reduce-motion");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ServiceWorkerRegister />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
