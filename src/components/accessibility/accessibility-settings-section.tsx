"use client";

import { useId } from "react";
import { Contrast, Minus, Plus, RotateCcw, Waves, type LucideIcon } from "lucide-react";

import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  useAccessibilityPrefs,
} from "@/hooks/use-accessibility-prefs";
import { cn } from "@/lib/utils";

/** Switch acessível (role="switch") — mesmo padrão visual em toda a seção. */
function AccessibilitySwitch({
  checked,
  onChange,
  icon: Icon,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  icon: LucideIcon;
  label: string;
  description: string;
}) {
  const labelId = useId();

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p id={labelId} className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {label}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-500">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={onChange}
        className={cn(
          "relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-700",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

/**
 * Versão "de página" das opções de acessibilidade — mesmo hook da toolbar
 * do Header (useAccessibilityPrefs), só que sempre visível e com mais
 * espaço/descrição, adequada pra tela de Configurações em vez de um popover
 * rápido.
 */
export function AccessibilitySettingsSection() {
  const fontLabelId = useId();
  const {
    mounted,
    fontScale,
    highContrast,
    reduceMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReduceMotion,
    resetToDefaults,
  } = useAccessibilityPrefs();

  const fontPercentLabel = mounted ? `${Math.round(fontScale * 100)}%` : "100%";

  return (
    <section aria-labelledby="acessibilidade-heading" className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="acessibilidade-heading"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Acessibilidade
        </h2>
        <button
          type="button"
          onClick={resetToDefaults}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-200"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restaurar padrões
        </button>
      </div>

      <div className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-900">
        <div className="flex items-start justify-between gap-4 py-3">
          <div>
            <p id={fontLabelId} className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Tamanho da fonte
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-500">
              Aumenta ou diminui o texto em todo o CertiBox, sem quebrar o layout.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
              className="w-12 text-center text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100"
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

        <AccessibilitySwitch
          checked={mounted && highContrast}
          onChange={toggleHighContrast}
          icon={Contrast}
          label="Alto contraste"
          description="Reforça o contraste de textos e bordas nos dois temas (claro e escuro)."
        />

        <AccessibilitySwitch
          checked={mounted && reduceMotion}
          onChange={toggleReduceMotion}
          icon={Waves}
          label="Reduzir movimento"
          description="Desativa transições e animações da interface."
        />
      </div>
    </section>
  );
}
