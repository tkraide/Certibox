"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEYS = {
  fontScale: "certibox:font-scale",
  highContrast: "certibox:high-contrast",
  reduceMotion: "certibox:reduce-motion",
} as const;

export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.6;
const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_DEFAULT = 1;

function clampFontScale(value: number): number {
  if (Number.isNaN(value)) return FONT_SCALE_DEFAULT;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round(value * 100) / 100));
}

function applyFontScale(scale: number) {
  document.documentElement.style.setProperty("--font-scale", String(scale));
}

function applyHighContrast(enabled: boolean) {
  if (enabled) {
    document.documentElement.setAttribute("data-contrast", "high");
  } else {
    document.documentElement.removeAttribute("data-contrast");
  }
}

function applyReduceMotion(enabled: boolean) {
  document.documentElement.classList.toggle("reduce-motion", enabled);
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // localStorage indisponível (modo privado, política de cookies etc.).
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignora — a preferência ainda é aplicada nesta sessão, só não persiste.
  }
}

/**
 * Preferências de acessibilidade da Toolbar própria do CertiBox: tamanho da
 * fonte, alto contraste e redução de movimento. São aplicadas globalmente
 * via atributo/variável/classe no <html> (ver globals.css) e persistidas no
 * localStorage.
 *
 * Um script inline em app/layout.tsx já aplica o valor salvo ANTES da
 * hidratação (mesma ideia do anti-flash do next-themes para o tema
 * claro/escuro) — este hook só sincroniza o estado do React com isso e
 * cuida das mudanças feitas pelos botões da toolbar.
 */
export function useAccessibilityPrefs() {
  const [fontScale, setFontScaleValue] = useState(FONT_SCALE_DEFAULT);
  const [highContrast, setHighContrastValue] = useState(false);
  const [reduceMotion, setReduceMotionValue] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const storedScale = readStorage(STORAGE_KEYS.fontScale);
    if (storedScale) {
      const parsed = clampFontScale(Number(storedScale));
      setFontScaleValue(parsed);
      applyFontScale(parsed);
    }

    const storedContrast = readStorage(STORAGE_KEYS.highContrast) === "1";
    setHighContrastValue(storedContrast);
    applyHighContrast(storedContrast);

    const storedMotion = readStorage(STORAGE_KEYS.reduceMotion) === "1";
    setReduceMotionValue(storedMotion);
    applyReduceMotion(storedMotion);
  }, []);

  const setFontScale = useCallback((updater: (current: number) => number) => {
    setFontScaleValue((current) => {
      const next = clampFontScale(updater(current));
      applyFontScale(next);
      writeStorage(STORAGE_KEYS.fontScale, String(next));
      return next;
    });
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontScale((current) => current + FONT_SCALE_STEP);
  }, [setFontScale]);

  const decreaseFontSize = useCallback(() => {
    setFontScale((current) => current - FONT_SCALE_STEP);
  }, [setFontScale]);

  const toggleHighContrast = useCallback(() => {
    setHighContrastValue((current) => {
      const next = !current;
      applyHighContrast(next);
      writeStorage(STORAGE_KEYS.highContrast, next ? "1" : "0");
      return next;
    });
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setReduceMotionValue((current) => {
      const next = !current;
      applyReduceMotion(next);
      writeStorage(STORAGE_KEYS.reduceMotion, next ? "1" : "0");
      return next;
    });
  }, []);

  /** Volta fonte/contraste/movimento para o padrão — usado na página de Configurações. */
  const resetToDefaults = useCallback(() => {
    applyFontScale(FONT_SCALE_DEFAULT);
    applyHighContrast(false);
    applyReduceMotion(false);
    writeStorage(STORAGE_KEYS.fontScale, String(FONT_SCALE_DEFAULT));
    writeStorage(STORAGE_KEYS.highContrast, "0");
    writeStorage(STORAGE_KEYS.reduceMotion, "0");
    setFontScaleValue(FONT_SCALE_DEFAULT);
    setHighContrastValue(false);
    setReduceMotionValue(false);
  }, []);

  return {
    mounted,
    fontScale,
    highContrast,
    reduceMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReduceMotion,
    resetToDefaults,
  };
}
