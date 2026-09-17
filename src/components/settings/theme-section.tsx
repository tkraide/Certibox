"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS: { value: ThemeOption; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

/**
 * Seletor de tema com 3 opções. O ThemeToggle do Header só alterna
 * claro/escuro (pensado pra um clique rápido); aqui, na tela de
 * Configurações, também dá pra escolher "Sistema" e seguir a preferência
 * do sistema operacional — os dois controles usam o mesmo `next-themes`,
 * então ficam sempre sincronizados.
 */
export function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Evita divergência de hidratação: o tema salvo só é conhecido no cliente.
  useEffect(() => setMounted(true), []);

  const selected: ThemeOption = mounted ? (theme as ThemeOption) ?? "system" : "system";

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = OPTIONS.findIndex((option) => option.value === selected);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + OPTIONS.length) % OPTIONS.length;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const nextOption = OPTIONS[nextIndex];
    setTheme(nextOption.value);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <section aria-labelledby="aparencia-heading" className="card">
      <h2
        id="aparencia-heading"
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
      >
        Aparência
      </h2>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
        Escolha o tema claro, escuro, ou siga a preferência do seu sistema.
      </p>

      <div
        role="radiogroup"
        aria-label="Tema"
        onKeyDown={handleKeyDown}
        className="mt-4 grid grid-cols-3 gap-2"
      >
        {OPTIONS.map((option, index) => {
          const isSelected = selected === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-400"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
