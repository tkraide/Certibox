"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (public/sw.js) assim que a página carrega —
 * junto com o manifest (src/app/manifest.ts) e os ícones, é o que faz o
 * navegador oferecer "Adicionar à tela inicial"/instalar o CertiBox.
 * Renderiza `null`: não existe nenhuma UI aqui, só o efeito colateral do
 * registro.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("CertiBox: falha ao registrar o service worker.", err);
    });
  }, []);

  return null;
}
