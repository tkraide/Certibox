"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";

import { Brand } from "./brand";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col md:flex",
        "border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
      )}
    >
      <div className="flex h-header items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
        <Brand />
      </div>

      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item.href, pathname);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                      : "font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary-500"
                    />
                  )}
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="flex flex-col leading-tight">
                    <span>{item.label}</span>
                    {item.description && (
                      <span
                        className={cn(
                          "text-xs font-normal",
                          active
                            ? "text-primary-700/80 dark:text-primary-400/80"
                            : "text-neutral-600 dark:text-neutral-400",
                        )}
                      >
                        {item.description}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <UserMenu className="flex-col items-start gap-2" />
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
          Hackathon SeCoT XVIII · UFSCar
        </p>
      </div>
    </aside>
  );
}
