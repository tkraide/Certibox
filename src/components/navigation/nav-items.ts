import {
  BarChart3,
  FileBadge,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  /** Rótulo curto para a Bottom Navigation (mobile). */
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    shortLabel: "Início",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Meus Certificados",
    shortLabel: "Certificados",
    href: "/certificados",
    icon: FileBadge,
  },
  {
    label: "Relatórios",
    shortLabel: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
  },
  {
    label: "Configurações",
    shortLabel: "Ajustes",
    href: "/configuracoes",
    icon: Settings,
    description: "Acessibilidade",
  },
];

/** Determina se um link está ativo para o pathname atual. */
export function isNavItemActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
