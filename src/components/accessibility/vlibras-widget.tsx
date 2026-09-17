"use client";

import Script from "next/script";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (rootUrl: string) => unknown;
    };
  }
}

/**
 * Widget oficial do governo (VLibras) para tradução em Libras — requisito
 * de acessibilidade do CertiBox. Renderizado uma única vez, globalmente
 * (ver AppShell), pra aparecer em todas as páginas.
 *
 * Marcação exatamente como a documentação oficial pede
 * (https://www.gov.br/governodigital/pt-br/vlibras); os atributos
 * `vw`/`vw-access-button`/`vw-plugin-wrapper` não são HTML padrão, então o
 * bloco vai via dangerouslySetInnerHTML em vez de JSX (o TypeScript não
 * conhece esses atributos como props válidas de <div>).
 */
export function VLibrasWidget() {
  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html:
            '<div vw class="enabled"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>',
        }}
      />
      <Script
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.VLibras) {
            new window.VLibras.Widget("https://vlibras.gov.br/app");
          }
        }}
      />
    </>
  );
}
