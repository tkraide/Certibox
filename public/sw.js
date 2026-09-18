// Service worker básico do CertiBox: cache "network-first" com fallback
// pra quando o dispositivo perde conexão — o suficiente pra passar nos
// critérios de instalação de PWA do navegador e dar uma experiência básica
// offline (reabrir uma página já visitada antes), sem tentar sincronizar
// dados em segundo plano ou coisas mais avançadas, que não fazem sentido
// pra esse protótipo.
const CACHE_NAME = "certibox-cache-v1";

const PRECACHE_URLS = ["/", "/login", "/icon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {
        // Falha de precache (ex.: offline na primeira instalação) não deve
        // impedir o service worker de ativar.
      }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só GET, só do próprio site — nunca intercepta chamadas ao Supabase, à
  // API do CertiBox (precisam sempre da rede, nunca de uma versão em cache)
  // ou o callback de OAuth.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/"))),
  );
});
