"use client";

import { UserCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

import { LogoutButton } from "./logout-button";

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
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">{user.name ?? user.email}</p>
        <p className="text-xs capitalize text-neutral-500 dark:text-neutral-400">
          {user.role}
        </p>
      </div>

      {user.avatar ? (
        <img
          src={user.avatar}
          alt=""
          className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-800"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-400">
          <UserCircle className="h-6 w-6" aria-hidden="true" />
        </div>
      )}

      <LogoutButton />
    </div>
  );
}
