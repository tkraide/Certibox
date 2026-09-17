"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Accessibility, Contrast, Minus, Plus, Waves } from "lucide-react";

import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  useAccessibilityPrefs,
} from "@/hooks/use-accessibility-prefs";
import { cn } from "@/lib/utils";

type AccessibilityToolbarProps = {
  className?: string;
};

/**
 * Toolbar de acessibilidade PRÓPRIA do CertiBox — não é um widget overlay de
 * terceiros (ver requisito). Fica atrás de um botão "Acessibilidade" no
 * Header (visível em qualquer página, telas grandes e pequenas) para não
 * ocupar espaço permanente, mas todo o conteúdo é navegável por teclado
 * (Tab entre os controles, Escape fecha) e os estados usam aria-pressed —
 * nada depende de hover ou de um widget externo.
 */
export function AccessibilityToolbar({ className }: AccessibilityToolbarProps) {
  const panelId = useId();
  const fontLabelId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    mounted,
    fontScale,
    highContrast,
    reduceMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReduceMotion,
  } = useAccessibilityPrefs();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const fontPercentLabel = mounted ? `${Math.round(fontScale * 100)}%` : "100%";
  const isHighContrast = mounted && highContrast;
  const isReduceMotion = mounted && reduceMotion;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Opções de acessibilidade"
        title="Acessibilidade"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Configurações de acessibilidade"
          className="fixed inset-x-4 top-[4.5rem] z-50 max-h-[calc(100vh-6rem)] space-y-3 overflow-y-auto rounded-xl border border-primary-500 bg-white p-4 shadow-card dark:border-primary-400 dark:bg-neutral-900 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:max-h-none sm:w-64 sm:overflow-visible"
        >
          <div>
            <p
              id={fontLabelId}
              className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              Tamanho da fonte
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={decreaseFontSize}
                disabled={mounted && fontScale <= FONT_SCALE_MIN}
                aria-label="Diminuir tamanho da fonte"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span
                aria-live="polite"
                aria-labelledby={fontLabelId}
                className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100"
              >
                {fontPercentLabel}
              </span>
              <button
                type="button"
                onClick={increaseFontSize}
                disabled={mounted && fontScale >= FONT_SCALE_MAX}
                aria-label="Aumentar tamanho da fonte"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={isHighContrast}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              isHighContrast
                ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-400"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
            )}
          >
            <span className="flex items-center gap-2">
              <Contrast className="h-4 w-4" aria-hidden="true" />
              Alto contraste
            </span>
            <span className="text-xs font-normal">{isHighContrast ? "Ativado" : "Desativado"}</span>
          </button>

          <button
            type="button"
            onClick={toggleReduceMotion}
            aria-pressed={isReduceMotion}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              isReduceMotion
                ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-400"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
            )}
          >
            <span className="flex items-center gap-2">
              <Waves className="h-4 w-4" aria-hidden="true" />
              Reduzir movimento
            </span>
            <span className="text-xs font-normal">{isReduceMotion ? "Ativado" : "Desativado"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
