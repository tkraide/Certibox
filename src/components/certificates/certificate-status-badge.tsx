import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

import type { CertificateStatus } from "@/lib/hours/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  CertificateStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  aprovado: {
    label: "Aprovado",
    icon: CheckCircle2,
    className: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
  },
  pendente: {
    label: "Pendente",
    icon: Clock,
    className: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  },
  rejeitado: {
    label: "Rejeitado",
    icon: XCircle,
    className: "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
  },
};

/**
 * Status SEMPRE com ícone + texto — nunca só cor (requisito de
 * acessibilidade do CertiBox).
 */
export function CertificateStatusBadge({
  status,
  className,
}: {
  status: CertificateStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
