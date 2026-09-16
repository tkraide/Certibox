import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 rounded-lg", className)}
      aria-label="CertiBox — ir para o Dashboard"
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-base font-bold text-neutral-950"
      >
        C
      </span>
      <span className="text-lg font-semibold tracking-tight">CertiBox</span>
    </Link>
  );
}
