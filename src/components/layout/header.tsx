import { Brand } from "@/components/navigation/brand";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Cabeçalho fixo. No mobile mostra a marca (a sidebar fica oculta);
 * no desktop mantém apenas as ações à direita.
 */
export function Header() {
  return (
    <header
      className={[
        "sticky top-0 z-30 flex h-header items-center justify-between gap-4 px-4 md:px-8",
        "border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90",
      ].join(" ")}
    >
      <Brand className="md:hidden" />
      <span className="hidden md:block" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
