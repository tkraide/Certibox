"use client";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

import { LogoutButton } from "./logout-button";
import { UserAvatar } from "./user-avatar";

export function UserMenu({ className }: { className?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={cn("h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800", className)} />
    );
  }

  if (!user) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3 self-stretch">
        <UserAvatar src={user.avatar} sizeClassName="h-9 w-9" iconSizeClassName="h-6 w-6" />

        <div className="hidden min-w-0 flex-1 text-left sm:block">
          <p className="truncate text-sm font-medium leading-tight">{user.name ?? user.email}</p>
          <p className="text-xs capitalize text-neutral-500 dark:text-neutral-400">
            {user.role}
          </p>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
