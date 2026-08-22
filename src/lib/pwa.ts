// Registro do service worker.
//
// Fica fora do main.tsx porque tem regra demais para uma linha solta:
//
//  · Em dev o service worker atrapalha — serve a casca velha por cima do HMR.
//    Lá ele é removido, senão quem já instalou o app uma vez fica preso numa
//    versão antiga do bundle enquanto edita o código.
//  · Falha em registrar não é erro do app. Navegador sem suporte, aba em modo
//    privado ou origem sem HTTPS caem no catch e a aplicação segue igual — o
//    PWA é melhoria, não requisito.

const CAMINHO_SW = '/sw.js';

export function registrarServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registros) => registros.forEach((registro) => registro.unregister()))
      .catch(() => {});
    return;
  }

  // Depois do load: registrar durante o carregamento faz o service worker
  // disputar banda com o próprio bundle na primeira visita.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(CAMINHO_SW, { scope: '/' }).catch((erro) => {
      console.warn('Service worker não registrado:', erro);
    });
  });
}
