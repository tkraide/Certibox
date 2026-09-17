import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 rounded-lg", className)}
      aria-label="CertiBox — ir para o Dashboard"
    >
      <img src="/logo.svg" alt="" aria-hidden="true" className="h-8 w-8" />
      <span className="text-lg font-semibold tracking-tight">CertiBox</span>
    </Link>
  );
}
