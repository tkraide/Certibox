"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  /** Exibe o rótulo textual ao lado do ícone (ex.: na sidebar). */
  showLabel?: boolean;
  className?: string;
};

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita divergência de hidratação: o tema só é conhecido no cliente.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors",
        "hover:bg-neutral-100 hover:text-neutral-900",
        "dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white",
        showLabel ? "px-3 text-sm font-medium" : "w-10",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5" aria-hidden="true" />
        )
      ) : (
        <span className="h-5 w-5" aria-hidden="true" />
      )}
      {showLabel && <span>{isDark ? "Tema claro" : "Tema escuro"}</span>}
    </button>
  );
}
