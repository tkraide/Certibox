import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileBadge,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/lib/auth/roles";

export type NavItem = {
  label: string;
  /** Rótulo curto para a Bottom Navigation (mobile). */
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  /** Papéis que veem este item. Omitido = visível para qualquer papel. */
  roles?: UserRole[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    shortLabel: "Início",
    href: "/",
    icon: LayoutDashboard,
    roles: ["aluno"],
  },
  {
    label: "Gerenciar certificados",
    shortLabel: "Gerenciar",
    href: "/",
    icon: ClipboardCheck,
    roles: ["professor"],
  },
  {
    label: "Meus Certificados",
    shortLabel: "Certificados",
    href: "/certificados",
    icon: FileBadge,
    roles: ["aluno"],
  },
  {
    label: "Relatórios",
    shortLabel: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    roles: ["aluno"],
  },
  {
    label: "Regulamentos",
    shortLabel: "Regras",
    href: "/regulamentos",
    icon: BookOpen,
  },
  {
    label: "Configurações",
    shortLabel: "Ajustes",
    href: "/configuracoes",
    icon: Settings,
    description: "Acessibilidade",
  },
];

/**
 * Itens de navegação visíveis para um papel — professor só vê "Gerenciar
 * certificados", Regulamentos e Configurações; aluno vê os demais. Durante o
 * carregamento da sessão (role indefinido), só os itens comuns aparecem.
 */
export function getNavItemsForRole(role: UserRole | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));
}

/** Determina se um link está ativo para o pathname atual. */
export function isNavItemActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
