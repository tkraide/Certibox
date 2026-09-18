import type { MetadataRoute } from "next";

// Convenção do Next.js: um arquivo `app/manifest.ts` é servido automaticamente
// em `/manifest.webmanifest`, com a tag <link rel="manifest"> já incluída no
// <head> — não precisa mexer no layout.tsx pra isso funcionar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CertiBox",
    short_name: "CertiBox",
    description: "Gestão pessoal de horas complementares e de extensão — UFSCar.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ff6c29",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
