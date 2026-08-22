// Service worker do PWA.
//
// Existe por dois motivos, nesta ordem:
//
//  1. O Chrome/Android só oferece "Instalar aplicativo" quando há um service
//     worker com handler de fetch. Sem este arquivo o manifest é lido, mas o
//     app nunca vira instalável fora do iOS.
//  2. Ninguém abre o app numa sala de ensaio com wi-fi bom. Guardamos a casca
//     (HTML, JS, CSS, ícones) para que a tela abra mesmo sem rede.
//
// O que NÃO é cacheado, de propósito:
//
//  · /api/* — agenda, acervo e arquivos mudam quando o coordenador troca a
//    missa. Servir versão velha aqui é pior que mostrar erro de rede.
//  · Qualquer coisa fora do nosso domínio (fontes do Google, Drive, YouTube).
//    O navegador já cuida disso e respostas opacas entopem o cache.

const VERSAO = 'la-v1';
const CACHE = `louvor-alianca-${VERSAO}`;

// Só o essencial para a primeira tela. Os assets com hash do Vite entram
// sozinhos conforme forem pedidos — listá-los aqui quebraria a cada build.
const CASCA = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      // addAll é tudo-ou-nada: um 404 num item derrubaria a instalação inteira
      // e o app ficaria sem service worker. Cada item vai por sua conta.
      .then((cache) => Promise.allSettled(CASCA.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const { request } = evento;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  // O próprio sw.js nunca entra no cache: uma cópia velha aqui impediria o
  // navegador de enxergar service worker novo, e o app congelaria na versão
  // antiga para sempre.
  if (url.pathname === '/sw.js') return;

  // Navegação: rede primeiro, para o deploy novo aparecer sem F5 forçado.
  // Sem rede, cai no index.html guardado — o app é SPA, o roteamento é dele.
  if (request.mode === 'navigate') {
    evento.respondWith(
      fetch(request)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put('/index.html', copia));
          return resposta;
        })
        .catch(() => caches.match('/index.html').then((r) => r ?? Response.error())),
    );
    return;
  }

  // Assets: cache primeiro. Os arquivos do Vite têm hash no nome, então uma
  // entrada cacheada nunca fica desatualizada — o build novo pede outra URL.
  evento.respondWith(
    caches.match(request).then((cacheado) => {
      if (cacheado) return cacheado;
      return fetch(request).then((resposta) => {
        if (resposta.ok && resposta.type === 'basic') {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copia));
        }
        return resposta;
      });
    }),
  );
});
