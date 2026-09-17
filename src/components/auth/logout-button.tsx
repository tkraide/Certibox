"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    // Login Google e login SIGA (simulado) são, hoje, os dois sessões reais
    // do Supabase Auth (OAuth e anônima, respectivamente) — um único
    // signOut() encerra qualquer uma das duas.
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors",
        "hover:bg-neutral-100 hover:text-neutral-900",
        "dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white",
        loading && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="h-4 w-4" aria-hidden="true" />
      )}
      Sair
    </button>
  );
}
