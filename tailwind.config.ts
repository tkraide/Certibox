import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Tema CertiBox
 *
 * - Dark mode por classe (`<html class="dark">`), controlado pelo next-themes.
 * - Cor primária: laranja #ff6c29 (escala 50–950).
 * - Restante da paleta em tons neutros puros (branco/preto/cinzas) para
 *   garantir contraste WCAG AA nos dois temas.
 *
 * Notas de contraste (WCAG AA, texto normal >= 4.5:1):
 * - `primary-500` (#ff6c29) sobre branco = ~2.8:1  -> usar apenas em ícones,
 *   bordas, indicadores e fundos de botão (com texto neutral-950 por cima, ~7.4:1).
 * - `primary-700` (#c2410c) sobre branco = ~5.3:1  -> texto laranja no tema claro.
 * - `primary-400`/`primary-500` sobre neutral-950 = ~7-8:1 -> texto laranja no tema escuro.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff6c29",
          50: "#fff4ee",
          100: "#ffe6d8",
          200: "#ffc9ad",
          300: "#ffa578",
          400: "#ff8748",
          500: "#ff6c29",
          600: "#f04f0a",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        // Superfícies semânticas — sempre neutras (sem tonalidade azulada)
        surface: {
          DEFAULT: "#ffffff",
          muted: "#fafafa",
          dark: "#0a0a0a",
          "dark-muted": "#171717",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        sidebar: "16rem",
        header: "4rem",
        "bottom-nav": "4rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
