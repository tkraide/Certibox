"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { NAV_ITEMS, isNavItemActive } from "./nav-items";

/**
 * Barra de navegação inferior (mobile, < md).
 * - Alvos de toque >= 44px, ícone + texto sempre visíveis.
 * - Respeita a safe-area de dispositivos com notch/gesture bar.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="grid h-bottom-nav grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-none text-xs transition-colors",
                  active
                    ? "font-semibold text-primary-700 dark:text-primary-400"
                    : "font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white",
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-primary-500"
                  />
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
