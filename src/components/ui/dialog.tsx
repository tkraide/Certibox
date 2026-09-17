"use client";

import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export type DialogHandle = {
  showModal: () => void;
  close: () => void;
};

type DialogProps = {
  titleId: string;
  title: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
};

/**
 * Wrapper fino sobre o <dialog> nativo: dá foco/ESC/backdrop de graça,
 * sem precisar de nenhuma lib de UI. Controlado via ref (showModal/close),
 * como o próprio elemento nativo.
 */
export const Dialog = forwardRef<DialogHandle, DialogProps>(function Dialog(
  { titleId, title, children, className, onClose },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    showModal: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] max-w-lg rounded-2xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-card",
        "backdrop:bg-neutral-950/50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:backdrop:bg-black/70",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Fechar"
          className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
    </dialog>
  );
});
